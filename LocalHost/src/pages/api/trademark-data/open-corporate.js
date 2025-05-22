const puppeteer = require("puppeteer");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { keyword } = req.body;

    try {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: "/usr/bin/google-chrome",
      });
      const page = await browser.newPage();

      const searchQuery = keyword || "Tesla";
      const url = `https://opencorporates.com/companies?q=${encodeURIComponent(
        searchQuery
      )}`;

      // Navigate to the page
      await page.goto(url, {
        waitUntil: "networkidle2", // Wait for the network to be idle
      });

      // Wait for the content to load
      await page.waitForSelector(".search-result");

      // Extract HTML content
      const html = await page.content();
      // console.log(html);
      // Use Cheerio to parse the content
      const $ = require("cheerio").load(html);
      const companies = [];

      $(".search-result").each((index, element) => {
        const companyName = $(element).find("h3 a").text().trim();
        const companyLink =
          "https://opencorporates.com" + $(element).find("h3 a").attr("href");

        if (companyName) {
          companies.push({
            name: companyName,
            link: companyLink,
          });
        }
      });

      // Close the browser
      // await browser.close();

      return res.status(200).json(companies);
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
