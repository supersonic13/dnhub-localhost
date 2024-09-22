const fs = require("fs");
const axios = require("axios");
export default async function handler(req, res) {
  const keywords = req.body?.domain?.keywords;

  const accessToken =
    "ya29.a0AcM612zmG8YsqqjCRIvL3z47xtl_m_Oskn-7hC-fjCB4diV_OjrpKUP431B8-sG5q_D6hYyJLngr_TGo2NfT32TCiOdpCesGd526Qyz8NW5x8obUrtfrelYPyUYjHrcJ-WYn0Q89KZ2Adyh3Jdc8DV5M39IM64P9Wg7EM5-rPVAaCgYKAdESARASFQHGX2MiUX56L-tistP2aomebk3NUw0178";
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
          },
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
      error.response?.data?.error?.details?.[0]?.errors,
    );
    res.json("error");
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
