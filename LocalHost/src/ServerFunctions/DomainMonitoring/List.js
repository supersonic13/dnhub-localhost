const { connectToMongoDB } = require("../db");

async function MonitoringDomainList(req, res) {
  try {
    const { db } = await connectToMongoDB();
    switch (req.method) {
      case "GET":
        const dns = await db
          .collection("dns-monitoring")
          .find()
          .toArray()
          .then((docs) => docs);
        const price = await db
          .collection("price-monitoring")
          .find()
          .toArray()
          .then((docs) => docs);

        res.json([...dns, ...price]);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}
module.exports = MonitoringDomainList;
