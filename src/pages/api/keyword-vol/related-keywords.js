const { connectToMongoDB } = require("../../../../db");

const fs = require("fs");
const axios = require("axios");
export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const { keyword } = req.body;

  const apiUrl = `https://googleads.googleapis.com/v19/customers/${api?.customerId}:generateKeywordIdeas`;

  try {
    switch (req.method) {
      case "POST":
        const response = await axios.post(
          apiUrl,
          {
            keywordSeed: {
              keywords: [keyword],
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
          // domain: x?.text
          //   ?.split(" ")
          //   ?.map((x) =>
          //     x?.slice(0, 1)?.toUpperCase()?.concat(x?.slice(1))?.join("")
          //   ),
          keyword: x?.text,
          keywordMetrics: x?.keywordIdeaMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));

        res.json(data);
      case "GET":
        res.json("hello");
    }
  } catch (error) {
    console.error("Error fetching keyword ideas:");
    res.json("error");
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
