const googleTrends = require("google-trends-api");
// import googleTrends from "google-trends-api";

async function InterestOverTime_4(socket, interestOverTimeInput4) {
  googleTrends
    .interestOverTime({
      keyword: interestOverTimeInput4,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2024-01-01"),
    })
    .then((results) => {
      socket.emit(
        "interest-over-time-4",
        JSON.parse(results)?.default?.timelineData
      );
    })
    .catch((err) => {
      console.error("Oh no there was an error", err);
    });
}

module.exports = InterestOverTime_4;
