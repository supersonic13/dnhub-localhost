import axios from "axios";

export default async function handler(req, res) {
  const { value } = req.body;
  try {
    const response = await axios.get(
      `https://auctions.godaddy.com/beta/findApiProxy/v4/aftermarket/find/auction/recommend?endTimeAfter=2025-06-26T06%3A33%3A45.820Z&experimentInfo=aftermarket-semantic-search-202502%3AB&paginationSize=150&paginationStart=0&query=hello&useExtRanker=true&useSemanticSearch=true
`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language":
            "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Priority: "u=1,i",
          "Sec-Ch-Ua":
            '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Linux"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
          Connection: "keep-alive",
          Host: "auctions.godaddy.com",
        },
      },
    );
    const data = response?.data;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status).json({ error });
    console.error(error);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
