const axios = require("axios");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const domain = req.body?.domain?.domain;

    try {
      const response = await axios.post(
        `https://ped.uspto.gov/api/queries`,
        {
          searchText: domain,
          fq: ["patentTitle:*"],
          fl: "patentNumber,patentTitle,applicantName,grantDate",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data); // Log the data to the console
      return res.status(200).json(response.data); // Send the response
    } catch (error) {
      console.error("Error fetching keyword ideas:", error.message);
      return res
        .status(500)
        .json({ error: "An error occurred while processing the request" });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ error: "Method not allowed" });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
