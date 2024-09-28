const WhoisLight = require("whois-light");

async function statusMonitoring(domain, transporter) {
  const whois = await WhoisLight.lookup({ format: true }, domain?.domain)
    .then((whois) => whois)
    .catch((err) => false);

  const oldObj = domain;
  const newObj = {
    domain: domain?.domain,
    isAvailable: !(whois?.["Creation Date"] || whois?.["Registered on"])
      ? "Available"
      : "Not Available",
    creationDate: whois?.["Creation Date"] || whois?.["Registered on"] || "n/a",
    updatedDate: whois?.["Updated Date"] || whois?.["Last updated"] || "n/a",
    expiryDate:
      whois?.["Registry Expiry Date"] || whois?.["Expiry date"] || "n/a",
    registrar: whois?.Registrar || "n/a",
    domainStatus: whois?.["Domain Status"]?.split(" ")?.[0] || "n/a",
  };

  // console.log(newObj, oldObj);

  if (oldObj?.domainStatus !== newObj?.domainStatus) {
    console.log(`${newObj?.domain} changed domain status`);
  } else {
    console.log(`No changes detected for ${newObj?.domain}`);
  }
}
module.exports = statusMonitoring;
