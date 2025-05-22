import WhoisLight from "whois-light";
import dns2 from "dns2";
const dns = new dns2();

export default async function availableMonitoring(
  domain,
  transporter,
) {
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
