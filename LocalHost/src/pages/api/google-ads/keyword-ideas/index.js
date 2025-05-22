import { connectToMongoDB } from "../../../../../db";
const axios = require("axios");

export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const keywords = req.body?.keywords;

  if (!api) {
    return res
      .status(500)
      .json({ status: false, message: "Google API credentials not found." });
  }

  try {
    switch (req.method) {
      case "POST": {
        const apiUrl = `https://googleads.googleapis.com/v17/customers/${api.customerId}:generateKeywordIdeas`;

        const response = await axios.post(
          apiUrl,
          {
            keywordSeed: {
              keywords: [keywords],
            },
            pageSize: 2000,
          },
          {
            headers: {
              Authorization: `Bearer ${api.accessToken}`,
              "developer-token": api.devToken,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response?.data?.results?.map((x) => ({
          keyword: x?.text,
          keywordMetrics: x?.keywordIdeaMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));

        return res.status(200).json(data);
      }

      default:
        return res
          .status(405)
          .json({ status: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      JSON.stringify(error?.response?.data || error)
    );
    return res
      .status(500)
      .json({ status: false, message: "Error fetching keyword ideas." });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
