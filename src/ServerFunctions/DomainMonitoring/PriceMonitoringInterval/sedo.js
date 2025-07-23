const soap = require("soap");
const { connectToMongoDB } = require("../../../../db");
const sedoUrl = "https://api.sedo.com/api/v1/?wsdl";
async function sedo(domain) {
  const { db } = await connectToMongoDB();
  const api = await db.collection("sedo-api").findOne({});

  const args = {
    partnerid: api?.partnerId,
    signkey: api?.signKey, //
    username: api?.userName,
    password: api?.password,
    domainlist: [[domain?.domain]],
  };
  const clients = await new Promise((resolve, reject) => {
    soap.createClient(sedoUrl, function (err, item) {
      if (err) {
        return reject(err);
      }
      resolve(item);
    });
  });
  const sedo = await new Promise((resolve, reject) => {
    clients.DomainStatus({ args }, function (err, result) {
      if (err) {
        return reject(err);
      }
      const isForSale = result?.return?.item?.forsale?.$value;
      if (isForSale) {
        resolve({
          domain: domain?.domain,
          status: true,
          forSale: isForSale,
          sedoPrice: result?.return?.item?.price?.$value,
          initialPrice: result?.return?.item?.price?.$value,
          currentPrice: result?.return?.item?.price?.$value,
          currency: result?.return?.item?.currency?.$value,
          domainStatus:
            result?.return?.item?.domainstatus?.$value,
        });
      } else {
        resolve({
          status: false,
        });
      }
    });
  });
  if (sedo?.status) {
    // get existing price first
    const existing = await db
      .collection("price-monitoring")
      .findOne({ domain: domain?.domain });

    // Save notification if price changed
    if (existing?.currentPrice !== sedo?.currentPrice) {
      const saveNotification = await db
        .collection("notifications")
        .insertOne({
          notificationName: "price monitoring",
          notificationType: "price-change",
          domain: domain?.domain,
          message: `Price changed from ${existing?.currentPrice} to ${sedo?.currentPrice} for domain ${domain?.domain}`,
          timestamp: new Date(),
          read: false,
          route:
            "/domain-monitoring/price?domain=" + domain?.domain,
        });
    }
  } else {
    // Save notification if domain is not available
    await db.collection("notifications").insertOne({
      notificationName: "price monitoring",
      notificationType: "domain deleted",
      domain: domain?.domain,
      message: `Domain ${domain?.domain} is not available anymore`,
      timestamp: new Date(),
      read: false,
      route:
        "/domain-monitoring/price?domain=" + domain?.domain,
    });
  }

  // Update pricing
  await db.collection("price-monitoring").updateOne(
    { domain: domain.domain },
    {
      $set: {
        currentPrice: sedo?.currentPrice,
        sedoPrice: sedo?.sedoPrice,
        forSale: sedo?.forSale,
        currency: sedo?.currency,
        domainStatus: sedo?.domainStatus,
      },

      $push: {
        history: {
          date: Date.now(),
          price: sedo?.sedoPrice,
        },
      },
    },
  );
}
module.exports = sedo;
