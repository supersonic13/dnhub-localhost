import axios from "axios";
import { connectToMongoDB } from "../../../../../db";

export default async function bulkDomainVolume(req, respond) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  const keywords = req?.body?.keywords;

  try {
    switch (req.method) {
      case "POST":
        const response = await axios
          .post(
            apiUrl,
            {
              keywords: [...keywords],
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
        // console.log(domains);
        const data = response?.results?.map((x) => ({
          keyword: x?.text,
          keywordMetrics: x?.keywordMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));
        respond.json(data);
        break;
    }
  } catch (error) {
    console.log(
      "Error fetching keyword ideas:",
      JSON.stringify(error?.response?.data)
    );
    // res.json("error");
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
