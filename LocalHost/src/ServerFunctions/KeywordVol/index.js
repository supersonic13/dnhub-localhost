const fs = require("fs");
const axios = require("axios");
const { connectToMongoDB } = require("../../../db");

async function KeywordVol(req, res) {
  const { keywords } = req.body?.domain;
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordIdeas`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        keywordSeed: {
          keywords: [keywords],
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

    const keywordIdeas = response.data;
    // console.log(keywordIdeas);
    // fs.writeFile(
    //   `./keywords_${Math.floor(Math.random() * 10000)}.json`,
    //   JSON.stringify(keywordIdeas),
    //   (err) => {
    //     console.log("done");
    //   }
    // );
    res.json(keywordIdeas);
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response?.data?.error,
      error.response?.data?.error?.details?.[0]?.errors
    );
    res.json("error");
  }
}
module.exports = KeywordVol;
