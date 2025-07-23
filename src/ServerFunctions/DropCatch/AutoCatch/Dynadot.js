const axios = require("axios");
const { connectToMongoDB } = require("../../../../db");
const dayjs = require("dayjs");

async function Dynadot(domain) {
  try {
    const { db } = await connectToMongoDB();
    const apis = await db.collection("dynadot-api").findOne({});
    const { enableDynadot } = await db
      .collection("auto-catch-domains")
      .findOne({}, { projection: { enableDynadot: 1 } });

    if (!enableDynadot) return; // Early exit if Godaddy is disabled
    const { api } = apis;
    const data = await axios
      .get(
        `https://api.dynadot.com/api3.json?key=${api}&command=register&domain=${domain}&duration=1&currency=USD`
      )
      .then((res) => res.data);

    await db.collection("api-responses").insertOne({
      api: "dynadot",
      domain,
      status: data?.RegisterResponse?.Status || "error",
      errorStatus: data?.RegisterResponse?.Status || "error",
      responseCode: data?.RegisterResponse?.ResponseCode || "0",
      date: dayjs().format("D MMM YYYY"),
      time: dayjs().format("HH:mm:ss"),
    });
  } catch (error) {
    // console.log("error", error?.response);
    // await db.collection("api-responses").insertOne({
    //   api: "dynadot",
    //   domain,
    //   status: 'error',
    //   errorStatus: '0',
    //   responseCode: error?.response?.data?.toString(),
    //   date: dayjs().format("D MMM YYYY"),
    //   time: dayjs().format("HH:mm:ss"),
    // });
  } finally {
  }
}
module.exports = Dynadot;
