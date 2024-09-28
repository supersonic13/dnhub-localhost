const axios = require("axios");
const accessToken = require("../../accessToken");
const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordHistoricalMetrics`;

const RandomWordsAdvance = async ({ words, ext }, socket) => {
  try {
    const response = await axios
      .post(
        apiUrl,
        {
          keywords: [...words],
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

    const data = response?.results?.map((x) => ({
      domain: x.text
        ?.split(" ")
        ?.map((z) => z.slice(0, 1).toUpperCase().concat(z.slice(1)))
        ?.join(""),
      keyword: x?.text,
      keywordMetrics: x?.keywordMetrics || {
        avgMonthlySearches: 0,
        competition: "LOW",
        competitionIndex: "0",
      },
    }));
    // console.log(data);
    socket.emit("random-words-advance", data);
  } catch (error) {
    console.error("Error fetching keyword ideas:", error);
    // res.json("error");
  }
};

module.exports = RandomWordsAdvance;
