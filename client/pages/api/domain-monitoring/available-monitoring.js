import WhoisLight from "whois-light";
import { client } from "../../../db";

export default async function AvailableMonitoring(req, res) {
  const { domain } = req.body;
  try {
    switch (req.method) {
      case "POST":
        const whois = await WhoisLight.lookup({ format: true }, domain)
          .then((whois) => whois)
          .catch((err) => false);

        const results = await client
          .db("localhost-server")
          .collection("available-monitoring")
          .updateOne(
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
        await client
          .db("localhost-server")
          .collection("available-monitoring")
          .find()
          .toArray()
          .then((docs) => res.json(docs));
    }
  } catch (error) {
    console.log(error);
  }
}
