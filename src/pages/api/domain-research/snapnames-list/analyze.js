import { connectToMongoDB } from "../../../../../db";

import { Worker } from "worker_threads";
import os from "os";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ status: false, message: "Method not allowed" });

  console.time("completed in");
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v21/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;
  try {
    const domains = await db
      .collection(req?.body?.value?.label)
      .find()
      .toArray();

    if (!domains || domains.length === 0) {
      return res.json({
        wordsCount: {},
        allDomains: [],
        allPos: [],
      });
    }
    // const numCPUs = Math.max(1, os.cpus().length - 1);
    const numCPUs = Math.max(1, os.cpus().length - 1); // leave 1 core free
    const chunkSize = Math.ceil(domains.length / numCPUs);
    const chunks = Array.from({ length: numCPUs }, (_, i) =>
      domains.slice(i * chunkSize, (i + 1) * chunkSize),
    );

    const runWorker = (chunk) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(
          "./src/pages/api/domain-research/snapnames-list/worker.js",
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
            keywordPlanNetwork: "GOOGLE_SEARCH",
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

    console.timeEnd("completed in");

    return res.json({
      allDomains: all_domains,
      allPos,
      wordsCount: wordFreqArr,
    });
  } catch (err) {
    // console.log(JSON.stringify(err.response?.data));
    return res
      .status(500)
      .json({ status: false, message: "Worker error", err });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
