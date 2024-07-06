// const googleTrends = require("google-trends-api");
import googleTrends from "google-trends-api";

async function GoogleTrends(socket, data) {
  googleTrends
    .realTimeTrends({
      geo: "IN",
      hl: "en",
      category: "m",
    })
    .then(function (results) {
      console.log(
        "These results are awesome",
        JSON.parse(results)?.storySummaries?.trendingStories[0],
      );
    })
    .catch(function (err) {
      console.error("Oh no there was an error", err);
    });
}

export default GoogleTrends;
