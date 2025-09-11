import { connectToMongoDB } from "../../../../db";
const fs = require("fs");
const axios = require("axios");

export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v21/customers/${api?.customerId}:generateKeywordIdeas`;

  const keywords = req.body?.domain?.keywords;
  try {
    switch (req.method) {
      case "POST":
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
              Authorization: `Bearer ${api?.accessToken}`,
              "developer-token": api?.devToken,
              "Content-Type": "application/json",
            },
          },
        );

        const data = response?.data?.results?.map((x) => ({
          keyword: x?.text,
          keywordMetrics: x?.keywordIdeaMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));

        res.json(data);
        break;
      case "GET":
        res.json("hello");
    }
  } catch (error) {
    console.error("Error fetching keyword ideas:", error);
    // console.log("error?.response?.data?.error?.details");
    res.json("error");
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
