import axios from "axios";
import accessToken from "../../../accessToken.js";

export default async function bulkDomainVolume(req, respond) {
  // const keywords = name?.split(".")[0];
  const faqs = req?.body?.faqs;
  const apiUrl = `https://googleads.googleapis.com/v17/customers/9165971495:generateKeywordHistoricalMetrics`;

  try {
    switch (req.method) {
      case "POST":
        const response = await axios
          .post(
            apiUrl,
            {
              // selectedBrands: ["/g/11trqc4t8q"],
              // brandPrefix: "oxy",
              keywords: [...faqs],
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
          keyword: x?.text,
          keywordMetrics: x?.keywordMetrics || {
            avgMonthlySearches: 0,
            competition: "LOW",
            competitionIndex: "0",
          },
        }));
        respond.json(data);
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
