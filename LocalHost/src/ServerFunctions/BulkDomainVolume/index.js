const axios = require("axios");
const WordsNinjaPack = require("./lib/wordsNinja.js");
const { connectToMongoDB } = require("../../../db.js");
const WordsNinja = new WordsNinjaPack();

async function BulkDomainVolume(socket, domains) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordIdeas`;

  const allWords = [];
  await WordsNinja.loadDictionary();

  try {
    domains?.map(async (x) => {
      const words = WordsNinja.splitSentence(x?.split(".")[0], {
        joinWords: true,
      });
      allWords.push(words);
    });

    const response = await axios
      .post(
        apiUrl,
        {
          keywords: [...allWords],
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

    socket.emit("bulk-domain-volume", data);
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response,
    );
    // res.json("error");
  }
}
module.exports = BulkDomainVolume;
