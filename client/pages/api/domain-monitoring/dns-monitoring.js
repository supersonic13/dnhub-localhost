import WhoisLight from "whois-light";
import dns2 from "dns2";
import { client } from "../../../db";
const dns = new dns2();
export default async function DnsMonitoring(req, res) {
  const { domain } = req.body;
  try {
    switch (req.method) {
      case "POST":
        const whois = await WhoisLight.lookup({ format: true }, domain)
          .then((whois) => whois)
          .catch((err) => false);

        const ip = await dns.resolveA(domain);

        const results = await client
          .db("localhost-server")
          .collection("dns-monitoring")
          .updateOne(
            { domain },
            {
              $set: {
                domain,
                ip: ip?.answers?.[0]?.address || "n/a",
                creationDate:
                  whois?.["Creation Date"] || whois?.["Registered on"] || "n/a",
                updatedDate:
                  whois?.["Updated Date"] || whois?.["Last updated"] || "n/a",
                expiryDate:
                  whois?.["Registry Expiry Date"] ||
                  whois?.["Expiry date"] ||
                  "n/a",
                registrar: whois?.Registrar || "n/a",
                domainStatus:
                  whois?.["Domain Status"]?.split(" ")?.[0] || "n/a",
                nameServer:
                  whois?.["Name Server"] || whois?.["Name servers"] || "n/a",
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
          .collection("dns-monitoring")
          .find()
          .toArray()
          .then((docs) => res.json(docs));
    }
  } catch (error) {
    console.log(error);
  }
}
