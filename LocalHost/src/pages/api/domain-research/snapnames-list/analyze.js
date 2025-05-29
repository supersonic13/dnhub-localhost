import { connectToMongoDB } from "../../../../../db";

import { Worker } from "worker_threads";
import os from "os";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ status: false, message: "Method not allowed" });

  console.time("completed in");
  const { client } = await connectToMongoDB();

  try {
    const domains = await client
      .db("localhost-server")
      .collection(req?.body?.value?.label)
      .find()
      .toArray();

    if (!domains || domains.length === 0) {
      return res.json({ wordsCount: {}, allDomains: [], allPos: [] });
    }
    // const numCPUs = Math.max(1, os.cpus().length - 1);
    const numCPUs = Math.max(1, os.cpus().length - 1); // leave 1 core free
    const chunkSize = Math.ceil(domains.length / numCPUs);
    const chunks = Array.from({ length: numCPUs }, (_, i) =>
      domains.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    const runWorker = (chunk) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(
          "./src/pages/api/domain-research/snapnames-list/worker.js",
          {
            workerData: { chunk },
          }
        );
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
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
    const wordFreqArr = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
    // console.log(wordFreqArr);
    console.timeEnd("completed in");
    return res.json({ allDomains, allPos, wordsCount: wordFreqArr });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Worker error" });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
