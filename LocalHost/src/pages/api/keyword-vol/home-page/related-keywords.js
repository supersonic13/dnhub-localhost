import WordsNinjaPack from "../../domain-analyze/lib/wordsNinja.js";
import { connectToMongoDB } from "../../../../../db.js";
import axios from "axios";
const WordsNinja = new WordsNinjaPack();

export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordIdeas`;

  const { keyword } = req.body;
  try {
    await WordsNinja.loadDictionary();

    const words = WordsNinja.splitSentence(keyword?.split(".")[0], {
      capitalizeFirstLetter: false,
    });
    switch (req.method) {
      case "POST":
        const response = await axios.post(
          apiUrl,
          {
            keywordSeed: {
              keywords: words,
            },
            pageSize: 2000,
          },

          {
            headers: {
              Authorization: `Bearer ${api?.accessToken}`,
              "developer-token": api?.devToken,
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

        res.json(data);
        break;
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
