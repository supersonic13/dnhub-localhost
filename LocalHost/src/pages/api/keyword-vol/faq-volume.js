import axios from "axios";
import { connectToMongoDB } from "../../../../db";

export default async function bulkDomainVolume(req, respond) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("google-api").findOne();
  const apiUrl = `https://googleads.googleapis.com/v17/customers/${api?.customerId}:generateKeywordHistoricalMetrics`;

  const faqs = req?.body?.faqs;

  try {
    switch (req.method) {
      case "POST":
        const response = await axios
          .post(
            apiUrl,
            {
              keywords: [...faqs],
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
    console.error("Error fetching keyword ideas:", error?.response);
    // res.json("error");
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
