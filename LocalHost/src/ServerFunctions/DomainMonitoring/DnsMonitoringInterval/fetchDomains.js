const { connectToMongoDB } = require("../../../../db");

async function fetchDomains() {
  const { db } = await connectToMongoDB();
  try {
    const domains = await db
      .collection("dns-monitoring")
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
