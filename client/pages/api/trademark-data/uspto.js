const axios = require("axios");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const domain = req.body?.domain?.domain;

    try {
      const baseUrl = "https://tsdrapi.uspto.gov/ts/cd/casestatus/";
      const searchType = "searchquery";

      // Construct the search URL with parameters
      const searchUrl = `${baseUrl}${searchType}`;

      const response = await axios.get(searchUrl, {
        params: {
          searchText: "crypto",
          // Optional parameters
          offset: 0, // Starting point for results
          limit: 10, // Number of results per page
          searchType: "exact", // Can be 'exact', 'prefix', or 'contains'
        },
        headers: {
          "USPTO-API-KEY": "5KFqkQeqO8MxROz7LgxIQ0Ko4uMPg06q", // Replace with your API key
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

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
