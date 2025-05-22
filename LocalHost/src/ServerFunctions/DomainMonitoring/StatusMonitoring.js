const { connectToMongoDB } = require("../db");
const WhoisLight = require("whois-light");

async function StatusMonitoring(req, res) {
  const { domain } = req.body;
  try {
    const { db } = await connectToMongoDB();
    switch (req.method) {
      case "POST":
        const whois = await WhoisLight.lookup({ format: true }, domain)
          .then((whois) => whois)
          .catch((err) => false);

        const results = await db.collection("status-monitoring").updateOne(
          { domain },
          {
            $set: {
              domain,
              isAvailable: !(
                whois?.["Creation Date"] || whois?.["Registered on"]
              )
                ? "Available"
                : "Not Available",
              creationDate:
                whois?.["Creation Date"] || whois?.["Registered on"] || "n/a",
              updatedDate:
                whois?.["Updated Date"] || whois?.["Last updated"] || "n/a",
              expiryDate:
                whois?.["Registry Expiry Date"] ||
                whois?.["Expiry date"] ||
                "n/a",
              registrar: whois?.Registrar || "n/a",
              domainStatus: whois?.["Domain Status"]?.split(" ")?.[0] || "n/a",
            },
          },
          { upsert: true }
        );

        if (results?.matchedCount === 0 && results?.upsertedCount > 0) {
          console.log("domain inserted");
        } else if (results?.matchedCount > 0 && results?.modifiedCount > 0) {
          console.log("domain modified");
        } else if (
          results?.matchedCount > 0 &&
          results?.modifiedCount === 0 &&
          results?.upsertedCount === 0
        ) {
          console.log("domain exist and no change");
        }

        res.json(results);
        break;
      case "GET":
        await db
          .collection("status-monitoring")
          .find()
          .toArray()
          .then((docs) => res.json(docs));
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}
module.exports = StatusMonitoring;
