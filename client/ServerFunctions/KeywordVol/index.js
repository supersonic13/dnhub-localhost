const fs = require("fs");
const axios = require("axios");
async function KeywordVol(req, res) {
  const { keywords } = req.body?.domain;
  // const keywords = name?.split(".")[0];
  console.log(keywords);
  const accessToken =
    "ya29.a0AcM612xGTnf7G8DxGDJqT3OihdLKcqB_Pc1MUrO2PalnTdEX6kTjjAaoTb2Le67abQvH86CoNI7rpi-MhPsM7TAzeXDUcv9CuO8TlT9kk3bmLGEJfsSzh0H9R-Dn8DdiyC8mLbOLv1xY-xbqax8oczn2a_QOIHwGAxOPFUpdoWUaCgYKAbkSARASFQHGX2Mi9zOssl3nUPfFMI6QbdySwg0178";
  const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordIdeas`;

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
          Authorization: `Bearer ${accessToken}`,
          "developer-token": "Wdmer3gPaI2ZZaSuidrdeQ",
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
