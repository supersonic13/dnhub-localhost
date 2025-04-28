import WordsNinjaPack from "../../domain-analyze/lib/wordsNinja.js";
import accessToken from "../../../../accessToken.js";
import axios from "axios";
const WordsNinja = new WordsNinjaPack();
const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordHistoricalMetrics`;

export default async function handler(req, res) {
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
          Authorization: `Bearer ${accessToken}`,
          "developer-token": "Wdmer3gPaI2ZZaSuidrdeQ",
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
