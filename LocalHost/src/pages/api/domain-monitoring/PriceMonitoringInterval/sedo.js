const soap = require("soap");
const sedoUrl = "https://api.sedo.com/api/v1/?wsdl";
async function sedo(domain, transporter) {
  const args = {
    partnerid: "327338",
    signkey: "f1200c40a7d8c36941d7e262fb6c07",
    username: "neelhabib",
    password: "Chissa@123",
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
      resolve(
        result?.return?.item?.forsale?.$value
          ? { price: result?.return?.item?.price?.$value }
          : { price: 0 }
      );
    });
  });
  if (sedo?.price > 0) {
    if (domain?.sedoPrice != sedo?.price) {
      console.log("price changed for ", domain.domain);
      const info = await transporter.sendMail({
        from: "psk pro <pskrpo@gmail.com", // sender address
        to: "catherine66@ethereal.email", // list of receivers
        subject: `sedo price not change for the domain ", ${domain?.domain}`, // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
      console.log(info);
    } else {
      console.log("sedo price not changed for the domain ", domain?.domain);
    }
  }
}
module.exports = sedo;
