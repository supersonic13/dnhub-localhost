import multer from "multer";
import { Worker } from "worker_threads";
import os from "os";
import fs from "fs";
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

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ status: false, message: "Method not allowed" });

  console.time("completed in");

  try {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ status: false, message: "Upload error" });
      }

      fs.readFile(`${req.file.path}`, "utf-8", async (err, data) => {
        if (err) {
          console.error("File read error:", err);
          return res.status(500).json({ status: false, message: "Read error" });
        }

        const domains = data
          .split("\n")
          .map((domain) => domain.trim())
          .filter(Boolean);

        if (!domains || domains.length === 0) {
          return res.json({ wordsCount: {}, allDomains: [], allPos: [] });
        }

        // Process domains in parallel using worker threads
        const numCPUs = Math.max(1, os.cpus().length); // leave 1 core free
        const chunkSize = Math.ceil(domains.length / numCPUs);
        const chunks = Array.from({ length: numCPUs }, (_, i) =>
          domains.slice(i * chunkSize, (i + 1) * chunkSize)
        );

        const runWorker = (chunk) =>
          new Promise((resolve, reject) => {
            const worker = new Worker(
              "./src/pages/api/domain-research/domain-analyze/worker.js",
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
        const wordFreqArr = Object.entries(wordFreq).sort(
          (a, b) => b[1] - a[1]
        );

        console.timeEnd("completed in");
        return res.json({ allDomains, allPos, wordsCount: wordFreqArr });
      });
    });
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
