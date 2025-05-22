// import axios from "axios";
// import * as cheerio from "cheerio";
const axios = require("axios");
const cheerio = require("cheerio");
async function NewsContent(socket, data) {
  const { url, source, title } = data?.content;

  try {
    const response = await axios.get(url);

    if (response?.status === 200) {
      const html = response?.data;
      const $ = cheerio?.load(html);
      // $("body script").remove();
      const content = $("p").text();

      socket.emit("news-content", {
        status: true,
        data: { content, url, source, title },
      });
    } else {
      socket.emit("news-content", { status: false });
    }
  } catch (e) {
    socket.emit("news-content", { status: false });
  }
}
module.exports = NewsContent;
