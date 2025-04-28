import { client } from "../../../db";
const soap = require("soap");
const sedoUrl = "https://api.sedo.com/api/v1/?wsdl";

export default async function SedoPremium(req, res) {
  const args = {
    partnerid: "327338", // "327338", // doc.sedoPartnerId,
    signkey: "f1200c40a7d8c36941d7e262fb6c07", // "f1200c40a7d8c36941d7e262fb6c07", //doc.sedoSignKey,
    keyword: req.body?.domain,
    tld: "com",
    kwtype: "C",
    resultsize: 100,
  };

  try {
    switch (req.method) {
      case "POST":
        soap.createClient(sedoUrl, function (err, clients) {
          clients?.DomainSearch({ args }, async function (err, result) {
            err && console.log("err");
            const domains = result?.return?.item?.map((x) => ({
              domain: x?.domain?.$value,
              price: x?.price?.$value,
              currency: x?.currency?.$value,
              url: x?.url?.$value,
            }));

            res.json(domains);
          });
        });
        break;
    }
  } catch (error) {
    res.json([{ domain: "error", price: 0 }]);
    console.log(error);
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
