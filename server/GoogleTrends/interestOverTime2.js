// const googleTrends = require("google-trends-api");
import googleTrends from "google-trends-api";

async function InterestOverTime_2(socket, interestOverTimeInput2) {
  googleTrends
    .interestOverTime({
      keyword: interestOverTimeInput2,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2024-01-01"),
    })
    .then((results) => {
      socket.emit(
        "interest-over-time-2",
        JSON.parse(results)?.default?.timelineData,
      );
    })
    .catch((err) => {
      console.error("Oh no there was an error", err);
    });
}

export default InterestOverTime_2;
