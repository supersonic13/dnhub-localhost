// import axios from "axios";
// import WordsNinjaPack from "./lib/wordsNinja.js";
const axios = require("axios");
const WordsNinjaPack = require("./lib/wordsNinja.js");
const accessToken = require("../../accessToken.js");
const WordsNinja = new WordsNinjaPack();

async function BulkDomainVolume(socket, domains) {
  // const keywords = name?.split(".")[0];

  const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordHistoricalMetrics`;

  const allWords = [];
  await WordsNinja.loadDictionary();

  //   console.log(domains);

  try {
    domains?.map(async (x) => {
      const words = WordsNinja.splitSentence(x?.split(".")[0], {
        joinWords: true,
      });
      allWords.push(words);
      //   console.log(words);
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
            Authorization: `Bearer ${accessToken}`,
            "developer-token": "Wdmer3gPaI2ZZaSuidrdeQ",
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res?.data);
    // console.log(domains);
    const data = response?.results?.map((x) => ({
      domain: domains.find(
        (y) =>
          x.text?.split(" ").join("") === y?.split("-").join("")?.split(".")[0]
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
    console.error("Error fetching keyword ideas:", error?.response);
    // res.json("error");
  }
}
module.exports = BulkDomainVolume;
