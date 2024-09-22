const axios = require("axios");
const WhoisLight = require("whois-light");
const dns2 = require("dns2");
const dns = new dns2();
const aNewName = "irfan Habib";
const anothername = "dsfsdfsd";

async function availableMonitoring(domain, transporter) {
  const whois = await WhoisLight.lookup(
    { format: true },
    domain?.domain,
  )
    .then((whois) => whois)
    .catch((err) => false);

  const oldObj = domain;
  const newObj = {
    domain: domain?.domain,
    isAvailable: !(
      whois?.["Creation Date"] || whois?.["Registered on"]
    )
      ? "Available"
      : "Not Available",
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
  };

  // console.log(newObj, oldObj);

  if (oldObj?.isAvailable !== newObj?.isAvailable) {
    console.log(
      `${newObj?.domain} changed availability status`,
    );
  } else {
    console.log(`No changes detected for ${newObj?.domain}`);
  }
}
module.exports = availableMonitoring;
