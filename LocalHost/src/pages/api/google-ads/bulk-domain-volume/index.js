import axios from "axios";
import WordsNinjaPack from "./lib/wordsNinja.js";
import { connectToMongoDB } from "../../../../../db.js";

export default async function bulkDomainVolume(req, respond) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  const domains = req?.body?.domains;

  const allWords = [];
  const WordsNinja = new WordsNinjaPack();
  try {
    switch (req.method) {
      case "POST":
        await WordsNinja.loadDictionary();
        domains?.map(async (x) => {
          const words = WordsNinja.splitSentence(
            x?.split(".")[0],
            {
              joinWords: true,
              // camelCaseSplitter: true,
              capitalizeFirstLetter: true,
            },
          );
          allWords.push(words);
        });
        // console.log("all words", allWords);

        const response = await axios
          .post(
            apiUrl,
            {
              // selectedBrands: ["/g/11trqc4t8q"],
              // brandPrefix: "oxy",
              keywords: [...allWords],
              // geoTargetConstants: ["geoTargetConstants/2840"],
              // keywordSeed: {
              //   keywords: allWords,
              // },
              // pageSize: 50,
            },

            {
              headers: {
                Authorization: `Bearer ${api?.accessToken}`,
                "developer-token": api?.devToken,
                "Content-Type": "application/json",
              },
            },
          )
          .then((res) => res?.data);
        // console.log(domains);
        const data = response?.results?.map((x) => ({
          domain: domains.find(
            (y) =>
              x.text?.split(" ").join("") ===
              y?.split("-").join("")?.split(".")[0],
          ),
          keyword: x?.text,
          keywordMetrics: x?.keywordMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));
        respond.json(data);
    }
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response,
    );
    // res.json("error");
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
