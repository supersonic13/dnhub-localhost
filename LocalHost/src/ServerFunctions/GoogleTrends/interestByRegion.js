const googleTrends = require("google-trends-api");
// import googleTrends from "google-trends-api";
async function InterestByRegion(socket, interestOverTimeInput1) {
  googleTrends
    .interestByRegion({
      keyword: interestOverTimeInput1,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2024-01-01"),
    })
    .then((results) => {
      console.log(results);
      // socket.emit(
      //   "interest-over-time-1",
      //   JSON.parse(results)?.default?.timelineData,
      // );
    })
    .catch((err) => {
      console.error("Oh no there was an error", err);
    });
}

module.exports = InterestByRegion;
