import { connectToMongoDB } from "../../../../db";
import axios from "axios";

export default async function handler(req, res) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v19/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;
  const words = req?.body?.words || [];

  try {
    const response = await axios
      .post(
        apiUrl,
        {
          keywords: [...words],
          historicalMetricsOptions: {
            includeAverageCpc: true,
          },
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
    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      JSON.stringify(error?.response?.data)
    );
    return res.status(500).json({
      error: "Error fetching keyword ideas",
      details: error?.response?.data || error.message,
    });
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
