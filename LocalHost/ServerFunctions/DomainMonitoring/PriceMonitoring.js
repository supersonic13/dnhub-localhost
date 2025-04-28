const client = require("../db");
const axios = require("axios");
const soap = require("soap");

const sedoUrl = "https://api.sedo.com/api/v1/?wsdl";

async function PriceMonitoring(req, res) {
  const { domain, price, cost } = req.body;

  const args = {
    partnerid: "327338",
    signkey: "f1200c40a7d8c36941d7e262fb6c07",
    username: "neelhabib",
    password: "Chissa@123",
    domainlist: [[domain]],
  };
  try {
    await client.connect();
    switch (req.method) {
      case "POST":
        // Promisify the soap.createClient call
        const clients = await new Promise((resolve, reject) => {
          soap.createClient(sedoUrl, function (err, item) {
            if (err) {
              return reject(err);
            }
            resolve(item);
          });
        });

        // Promisify the DomainInsert call
        const sedo = await new Promise((resolve, reject) => {
          clients.DomainStatus({ args }, function (err, result) {
            if (err) {
              return reject(err);
            }
            resolve(
              result?.return?.item?.forsale?.$value
                ? { price: result?.return?.item?.price?.$value }
                : { price: 0 }
            );
          });
        });
        console.log(sedo);
        const afternic = await axios
          .get(
            `https://auctions.godaddy.com/beta/findApiProxy/v4/aftermarket/find/auction/recommend?&query=${domain}&paginationSize=1&paginationStart=0`
          )
          .then((response) =>
            response.data?.results?.map((x) =>
              x?.fqdn === domain
                ? { price: x?.auction_price_usd }
                : { price: 0 }
            )
          );
        console.log(afternic?.[0]);

        const results = await client
          .db("localhost-server")
          .collection("price-monitoring")
          .updateOne(
            { domain },
            {
              $set: {
                domain,
                price,
                sedoPrice: sedo?.price || 0,
                afternicPrice: afternic?.[0]?.price || 0,
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
          .collection("price-monitoring")
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
module.exports = PriceMonitoring;
