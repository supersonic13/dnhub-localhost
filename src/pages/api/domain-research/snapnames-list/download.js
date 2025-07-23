import axios from "axios";
import { promisify } from "util";
import { createWriteStream, createReadStream } from "fs";
import { unlink } from "fs/promises";
import { pipeline } from "stream";
import { parse } from "csv-parse";
import fs from "fs";
import readline from "readline";
import { connectToMongoDB } from "../../../../../db";
const streamPipeline = promisify(pipeline);

export async function downloadAndProcessCSV(url) {
  const tempPath = "/tmp/download.csv";
  try {
    // Download the file
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    // Save the stream to a file
    await streamPipeline(response.data, createWriteStream(tempPath));

    // Find the header line number
    const fileStream = fs.createReadStream(tempPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headerLine = 0;
    let foundHeader = false;
    let headerText = "Domain name,Current bid,Auction end date";
    for await (const line of rl) {
      headerLine++;
      if (
        line.trim().startsWith("Domain name,") ||
        line.trim().startsWith("Domain Name,")
      ) {
        foundHeader = true;
        break;
      }
    }
    rl.close();

    if (!foundHeader) throw new Error("CSV header not found!");

    // Parse CSV file from the header line
    const records = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(tempPath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            from_line: headerLine,
          })
        )
        .on("data", (row) => records.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Clean up: delete temporary file
    await unlink(tempPath);

    return records;
  } catch (error) {
    console.error("Error processing CSV file:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  const { client } = await connectToMongoDB();
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const url = req.body?.value?.value;
    const collectionName = req.body?.value?.label;
    const data = await downloadAndProcessCSV(url);

    await client
      .db("localhost-server")
      .collection(collectionName)
      .deleteMany()
      .then(() => console.log("deleted"))
      .catch((err) => console.log(err));

    if (data.length > 0) {
      await client
        .db("localhost-server")
        .collection(collectionName)
        .insertMany(data)
        .then(() => {
          console.log("completed");
        })
        .catch((err) => console.log(err));
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
