import axios from "axios";
import WordsNinjaPack from "./lib/wordsNinja.js";
import { connectToMongoDB } from "../../../../../db.js";

export default async function bulkDomainVolume(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v19/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  const domains = req?.body?.domains;

  const allWords = [];
  const WordsNinja = new WordsNinjaPack();
  try {
    switch (req.method) {
      case "POST":
        await WordsNinja.loadDictionary();
        for (const x of domains || []) {
          const words = WordsNinja.splitSentence(
            x?.split(".")[0],
            {
              joinWords: true,
              capitalizeFirstLetter: true,
            },
          );
          allWords.push(words);
        }

        const response = await axios.post(
          apiUrl,
          { keywords: allWords },
          {
            headers: {
              Authorization: `Bearer ${api?.accessToken}`,
              "developer-token": api?.devToken,
              "Content-Type": "application/json",
            },
          },
        );

        const data = response?.data?.results?.map((x) => ({
          domain: domains.find(
            (y) =>
              x.text?.split(" ").join("") ===
              y
                ?.split("-")
                .join("")
                ?.split(".")[0]
                .toLowerCase(),
          ),
          keyword: x?.text,
          keywordMetrics: x?.keywordMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
          closeVariants: x?.closeVariants || [],
        }));
        return res.status(200).json(data);
    }
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response || error,
    );
    return res
      .status(500)
      .json({
        error: "Error fetching keyword ideas",
        details: error?.message,
      });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
