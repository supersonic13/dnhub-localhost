import axios from "axios";
import accessToken from "../../../accessToken.js";

export default async function bulkDomainVolume(req, res) {
  console.log(req.body);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const keyword = req?.body?.keyword;
  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ error: "Invalid keyword" });
  }

  const [keyword1, keyword2] = keyword.split(" ");
  const apiUrl = `https://googleads.googleapis.com/v18/customers/9165971495:suggestBrands`;

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": "Wdmer3gPaI2ZZaSuidrdeQ",
      "Content-Type": "application/json",
    };

    const responses = await Promise.all([
      keyword2
        ? axios
            .post(apiUrl, { brandPrefix: keyword }, { headers })
            .then((res) => res?.data)
        : Promise.resolve(null),

      axios
        .post(apiUrl, { brandPrefix: keyword1 }, { headers })
        .then((res) => res?.data),

      keyword2
        ? axios
            .post(apiUrl, { brandPrefix: keyword2 }, { headers })
            .then((res) => res?.data)
        : Promise.resolve(null),
    ]);

    const allResults = responses
      .filter(Boolean) // Remove null responses
      .flatMap((resp) => resp.brands || []); // Extract results

    res.json(allResults);
  } catch (error) {
    console.error(
      "Error fetching keyword ideas:",
      error?.response?.data || error.message
    );
    res.status(500).json([{ name: "Request Failed. Please try again." }]);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
