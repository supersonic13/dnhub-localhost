import multer from "multer";
import { Worker } from "worker_threads";
import os from "os";
import fs from "fs";
import readline from "readline";
import { parse } from "csv-parse";
import { promisify } from "util";
import { pipeline } from "stream";
const streamPipeline = promisify(pipeline);
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  limits: {
    fileSize: 10000000000,
  },
});
import { connectToMongoDB } from "../../../../../db";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ status: false, message: "Method not allowed" });

  console.time("completed in");
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v19/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;
  try {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res
          .status(500)
          .json({ status: false, message: "Upload error" });
      }

      const tempPath = req.file.path;

      // await streamPipeline(response.data, createWriteStream(tempPath));

      // Find the header line number
      const fileStream = fs.createReadStream(tempPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let headerLine = 0;
      let foundHeader = false;

      for await (const line of rl) {
        headerLine++;
        if (
          line.trim().startsWith("Domain,") ||
          line.trim().startsWith("Domain name,") ||
          line.trim().startsWith("Domain Name,")
        ) {
          foundHeader = true;
          break;
        }
      }
      rl.close();

      if (!foundHeader)
        throw new Error("CSV header not found!");

      // Parse CSV file from the header line
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(tempPath)
          .pipe(
            parse({
              columns: true,
              skip_empty_lines: true,
              from_line: headerLine,
              relax_column_count: true, // <-- Add this line
            }),
          )
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
      if (rows.length === 0) {
        return res.json({
          wordsCount: {},
          allDomains: [],
          allPos: [],
        });
      }

      // Process rows in parallel using worker threads (same as before)
      const numCPUs = Math.max(1, os.cpus().length);
      const chunkSize = Math.ceil(rows.length / numCPUs);
      const chunks = Array.from({ length: numCPUs }, (_, i) =>
        rows.slice(i * chunkSize, (i + 1) * chunkSize),
      );

      const runWorker = (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(
            "./src/pages/api/domain-research/domain-analyze/worker2.js",
            {
              workerData: { chunk },
            },
          );
          worker.on("message", resolve);
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0)
              reject(
                new Error(
                  `Worker stopped with exit code ${code}`,
                ),
              );
          });
        });

      const results = await Promise.all(chunks.map(runWorker));
      // Merge results
      const allDomains = results.flatMap((r) => r.allDomains);
      const allPos = results.flatMap((r) => r.allPos);
      const wordsCount = results.flatMap((r) => r.wordsCount);
      // Merge frequency tables
      const wordFreq = {};

      wordsCount.forEach(([word, count]) => {
        wordFreq[word] = (wordFreq[word] || 0) + count;
      });

      // Convert to sorted array
      const wordFreqArr = Object.entries(wordFreq).sort(
        (a, b) => b[1] - a[1],
      );

      // Keyword Volume batch process
      const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const BATCH_SIZE = 9000;
      let all_domains = [];

      for (let i = 0; i < allDomains.length; i += BATCH_SIZE) {
        const batch = allDomains.slice(i, i + BATCH_SIZE);
        const keywords = batch?.map((x) =>
          x.splittedWords?.join(" "),
        );
        const keywordVol = await axios
          .post(
            apiUrl,
            {
              keywords,
              historicalMetricsOptions: {
                includeAverageCpc: true,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${api?.accessToken}`,
                "developer-token": api?.devToken,
                "Content-Type": "application/json",
              },
            },
          )
          .then((res) => res.data?.results)
          .catch((err) => {
            console.log(err?.response?.data?.error);
            return [];
          });

        const keywordMap = new Map();
        (keywordVol ?? []).forEach((a) => {
          // Add a.text as a key
          if (a?.text)
            keywordMap.set(a.text.trim().toLowerCase(), a);
          // Add all closeVariants as keys
          if (Array.isArray(a?.closeVariants)) {
            a.closeVariants.forEach((variant) => {
              if (variant)
                keywordMap.set(variant.trim().toLowerCase(), a);
            });
          }
        });

        const batch_domains = batch?.map((x) => {
          const match = keywordMap.get(
            x?.splittedWords?.join(" "),
          );
          return {
            ...x,
            domain: match ? x.domain : x.domain,
            keyword: match?.text || x?.keyword,
            keywordMetrics: match?.keywordMetrics || {
              avgMonthlySearches: 0,
              competition: "LOW",
              competitionIndex: "0",
              averageCpcMicros: 0,
            },
          };
        });

        all_domains = all_domains.concat(batch_domains);

        if (i + BATCH_SIZE < allDomains.length) {
          await sleep(10000);
        }
      }

      console.timeEnd("completed in");

      return res.json({
        allDomains: all_domains,
        allPos,
        wordsCount: wordFreqArr,
      });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, message: "Worker error" });
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
