const axios = require("axios");
const { connectToMongoDB } = require("../../../db.js");

const RandomWordsAdvance = async ({ words, ext }, socket) => {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  try {
    const response = await axios
      .post(
        apiUrl,
        {
          keywords: [...words],
        },

        {
          headers: {
            Authorization: `Bearer ${api?.accessToken}`,
            "developer-token": api?.devToken,
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
    console.error(
      "Error fetching keyword ideas:",
      JSON.stringify(error?.response?.data)
    );
    // res.json("error");
  }
};

module.exports = RandomWordsAdvance;
