const WhoisLight = require("../../../lib");
const { connectToMongoDB } = require("../../../../db");
const dns2 = require("dns2");
const dns = new dns2();
async function statusMonitoring(domain) {
  const { db } = await connectToMongoDB();
  try {
    // const domain = await db
    //   .collection("status-monitoring")
    //   .findOne({ domain });
    // console.log(domain, domain);

    if (!domain) return;

    const [A, NS, whois] = await Promise.all([
      dns.resolve(domain.domain, "A").then((x) => x?.answers),
      dns.resolve(domain.domain, "NS").then((x) => x?.answers),
      WhoisLight.lookup({ format: true }, domain.domain).catch(
        () => ({}),
      ),
    ]);

    const newStatus = {
      domain: domain.domain,
      isAvailable: !(
        whois?.["Creation Date"] || whois?.["Registered on"]
      )
        ? "Available"
        : "Registered",
      creationDate:
        whois?.["Creation Date"] ||
        whois?.["Registered on"] ||
        "n/a",
      updatedDate:
        whois?.["Updated Date"] ||
        whois?.["Last updated"] ||
        "n/a",
      expiryDate:
        whois?.["Registry Expiry Date"] ||
        whois?.["Expiry date"] ||
        "n/a",
      registrar: whois?.Registrar || "n/a",
      domainStatus:
        whois?.["Domain Status"]?.split(" ")?.[0] || "n/a",
      nameServer: Array.isArray(NS)
        ? NS?.map((x) => x?.ns)
        : "n/a",
      ip: Array.isArray(A) ? A?.map((x) => x?.address) : "n/a",
    };

    const keyCheck = (key) =>
      key === "isAvailable"
        ? "The domain availability changed"
        : key === "creationDate"
          ? "The domain creation date changed"
          : key === "nameServer"
            ? "The domain name servers changed"
            : key === "ip"
              ? "The domain IP addresses changed"
              : key === "updatedDate"
                ? "The domain update date changed"
                : key === "registrar"
                  ? "The domain registrar changed"
                  : key === "expiryDate"
                    ? "The domain expiry date changed"
                    : "The domain status changed";

    // Collect changed fields for $set and $push
    let updateSet = {};
    let updatePush = {};
    let changes = [];

    for (let key in newStatus) {
      let oldValue =
        typeof domain[key] !== "object"
          ? domain[key]
          : domain[key]?.value;
      let newValue = newStatus[key];
      const isArray = Array.isArray(newValue);
      const isChanged = isArray
        ? JSON.stringify(newValue) !== JSON.stringify(oldValue)
        : newValue !== oldValue;

      if (isChanged) {
        console.log("some domain changed", newValue, oldValue);
        // Prepare $set and $push updates for this key
        updateSet[`${key}.value`] = newValue;
        updatePush[`${key}.history`] = {
          date: Date.now(),
          status: newValue,
        };

        // record changed field for notification
        changes.push({
          key,
          message: keyCheck(key),
        });
      } else {
        console.log("no domain changed");
      }
    }

    // Send notifications for changed fields (if any)
    for (const ch of changes) {
      await db.collection("notifications").insertOne({
        notificationName: "status monitoring",
        notificationType: "domain update",
        domain: domain.domain,
        message: ch.message,
        timestamp: new Date(),
        read: false,
        route:
          "/domain-monitoring/status?domain=" + domain.domain,
      });
    }

    // Perform update (only when there are changes)
    if (Object.keys(updateSet).length > 0) {
      await db.collection("status-monitoring").updateOne(
        { domain: domain.domain },
        {
          $set: updateSet,
          $push: updatePush,
        },
      );
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = statusMonitoring;
