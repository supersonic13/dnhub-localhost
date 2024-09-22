const client = require("../db");

async function MonitoringDomainList(req, res) {
  try {
    await client.connect();
    switch (req.method) {
      case "GET":
        const dns = await client
          .db("localhost-server")
          .collection("dns-monitoring")
          .find()
          .toArray()
          .then((docs) => docs);
        const price = await client
          .db("localhost-server")
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
