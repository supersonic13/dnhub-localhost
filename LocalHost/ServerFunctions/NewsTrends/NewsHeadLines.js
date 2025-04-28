const axios = require("axios");
// import axios from "axios";
function NewsHeadLines(socket, topic) {
  axios
    .get(
      `https://newsapi.org/v2/everything?q=${
        topic || "crypto"
      }&apiKey=9e1f5f7e53ac45d1b5086d60b84500ee&pageSize=100`
    )
    .then((respond) => socket.emit("news-headlines", respond.data))
    .catch((err) => console.log(err));
}
module.exports = NewsHeadLines;
