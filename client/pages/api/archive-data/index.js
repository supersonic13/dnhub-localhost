const axios = require("axios");
export default async function handler(req, res) {
  const domain = req.body?.domain?.domain;

  try {
    switch (req.method) {
      case "POST":
        const captures = await axios
          .get(`http://web.archive.org/cdx/search/cdx`, {
            params: {
              url: "amazon.com",
              output: "json",
              limit: 1,
              sort: "asc",
            },
          })
          .then((res) => res.data);

        res.json(captures);
    }
  } catch (error) {
    console.error("Error fetching keyword ideas:", error);
    res.json("error");
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
