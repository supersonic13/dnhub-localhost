import { promisify } from "util";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import AdmZip from "adm-zip";
import multer from "multer";
import { parse } from "csv-parse/sync"; // Add this line
import { Worker } from "worker_threads";
import os from "os";
import { connectToMongoDB } from "../../../../../db";
import axios from "axios";
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

// Example API route implementation
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed" });
  }

  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v19/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  try {
    console.time("completed in");
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload error" });
      }

      // Read and process the ZIP file
      const zip = new AdmZip(req.file.path);
      const zipEntries = zip.getEntries();

      let csvData = [];
      // Process each file in the ZIP
      for (const entry of zipEntries) {
        if (
          !entry.isDirectory &&
          entry.entryName.endsWith(".csv")
        ) {
          let content = entry.getData().toString("utf8");
          const lines = content.split("\n");
          // Find the header line index
          let headerIndex = lines.findIndex((line) =>
            line.trim().startsWith("Domain,"),
          );
          if (headerIndex === -1) continue; // No valid header found, skip this file
          // Only use lines from the header onwards
          content = lines.slice(headerIndex).join("\n");
          // Parse CSV content
          csvData = parse(content, {
            columns: true,
            skip_empty_lines: true,
          });
        }
      }

      if (csvData.length === 0) {
        return res
          .status(400)
          .json({ message: "No CSV file found in ZIP." });
      }
      const numCPUs = Math.max(1, os.cpus().length - 1); // leave 1 core free
      const chunkSize = Math.ceil(csvData.length / numCPUs);
      const chunks = Array.from({ length: numCPUs }, (_, i) =>
        csvData.slice(i * chunkSize, (i + 1) * chunkSize),
      );
      const runWorker = (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(
            "./src/pages/api/domain-research/drop-catch-com/worker.js",
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
            // console.log(err?.response?.data);
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
            },
          };
        });

        all_domains = all_domains.concat(batch_domains);

        if (i + BATCH_SIZE < allDomains.length) {
          await sleep(10000);
        }
      }

      // console.log(wordFreqArr);
      console.timeEnd("completed in");
      return res.json({
        allDomains: all_domains,
        allPos,
        wordsCount: wordFreqArr,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error" });
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
