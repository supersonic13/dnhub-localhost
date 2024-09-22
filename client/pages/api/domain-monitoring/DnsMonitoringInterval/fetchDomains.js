const client = require("../../db");
async function fetchDomains() {
  try {
    await client.connect();
    const domains = await client
      .db("localhost-server")
      .collection("dns-monitoring")
      .find()
      .project({ _id: 0 })
      .toArray();
    return domains;
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  } finally {
    await client.close();
  }
}
module.exports = fetchDomains;
