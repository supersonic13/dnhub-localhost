const { client } = require("../../../db");

async function fetchDomains() {
  try {
    const domains = await client
      .db("localhost-server")
      .collection("status-monitoring")
      .find()
      .project({ _id: 0 })
      .toArray();
    return domains;
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  }
}
module.exports = fetchDomains;
