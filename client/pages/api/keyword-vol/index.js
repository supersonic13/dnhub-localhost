import accessToken from "../../../accessToken";

const fs = require("fs");
const axios = require("axios");
export default async function handler(req, res) {
  const keywords = req.body?.domain?.keywords;

  const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordIdeas`;

  try {
    switch (req.method) {
      case "POST":
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

        res.json(keywordIdeas);
      case "GET":
        res.json("hello");
    }
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response?.data?.error,
      error.response?.data?.error?.details?.[0]?.errors
    );
    res.json("error");
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
