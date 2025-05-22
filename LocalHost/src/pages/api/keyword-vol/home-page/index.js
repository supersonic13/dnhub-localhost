import WordsNinjaPack from "../../domain-analyze/lib/wordsNinja.js";
import axios from "axios";
import { connectToMongoDB } from "../../../../../db.js";
const WordsNinja = new WordsNinjaPack();

export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();

  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;
  const domain = req.body?.domain;
  try {
    await WordsNinja.loadDictionary();

    const words = WordsNinja.splitSentence(domain?.split(".")[0], {
      capitalizeFirstLetter: false,
    });

    const keywordVol = await axios.post(
      apiUrl,
      {
        keywords: [words?.join(" ")],
      },

      {
        headers: {
          Authorization: `Bearer ${api?.accessToken}`,
          "developer-token": api?.devToken,
          "Content-Type": "application/json",
        },
      }
    );
    const data = keywordVol?.data?.results?.map((x) => ({
      keyword: x?.text,
      keywordMetrics: x?.keywordMetrics || {
        avgMonthlySearches: 0,
        competition: "LOW",
        competitionIndex: "0",
      },
    }));

    res.status(200).json(data);
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
