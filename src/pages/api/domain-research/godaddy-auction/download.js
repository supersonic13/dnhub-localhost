import axios from "axios";
import { promisify } from "util";
import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import { pipeline } from "stream";
import * as AdmZip from "adm-zip";
import { connectToMongoDB } from "../../../../../db";
// Convert pipeline to promise-based
const streamPipeline = promisify(pipeline);

export async function downloadAndProcessZip(url) {
  try {
    // Download the file
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    // Temporary file path
    const tempPath = "/tmp/download.zip";

    // Save the stream to a file
    await streamPipeline(
      response.data,
      createWriteStream(tempPath),
    );

    // Read and process the ZIP file
    const zip = new AdmZip(tempPath);
    const zipEntries = zip.getEntries();

    // Process each file in the ZIP
    const processedData = [];

    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        // Convert buffer to string and parse JSON
        const content = entry.getData().toString("utf8");
        const jsonData = JSON.parse(content);
        processedData.push(jsonData);
      }
    }

    // Clean up: delete temporary file
    await unlink(tempPath);

    return processedData;
  } catch (error) {
    console.error("Error processing ZIP file:", error);
    throw error;
  }
}

// Example API route implementation
export default async function handler(req, res) {
  const { client } = await connectToMongoDB();
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed" });
  }

  try {
    const url = req.body?.value?.value;
    const data = await downloadAndProcessZip(url);

    const deleteResult = await client
      .db("localhost-server")
      .collection(req?.body?.value?.label)
      .deleteMany({});
    const deletedCount = deleteResult?.deletedCount ?? 0;

    let insertedCount = 0;
    if (data.length > 0) {
      const insertResult = await client
        .db("localhost-server")
        .collection(req?.body?.value?.label)
        .insertMany(data?.[0]?.data);
      insertedCount = insertResult?.insertedCount ?? 0;
    }

    return res
      .status(200)
      .json({ status: true, deletedCount, insertedCount });
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
