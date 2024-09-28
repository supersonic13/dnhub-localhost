import WhoisLight from "whois-light";
import dns2 from "dns2";
const dns = new dns2();

export default async function dnsMonitoring(
  domain,
  transporter,
) {
  const whois = await WhoisLight.lookup(
    { format: true },
    domain?.domain,
  )
    .then((whois) => whois)
    .catch((err) => false);

  const ip = await dns.resolveA(domain?.domain);
  // const ip = ip?.answers?.[0]?.address || "";
  const oldObj = domain;
  const newObj = {
    domain: domain?.domain,
    ip: ip?.answers?.[0]?.address || "n/a",
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
    nameServer:
      whois?.["Name Server"] ||
      whois?.["Name servers"] ||
      "n/a",
  };

  // console.log(newObj, oldObj);

  let changes = [];

  for (let key in newObj) {
    if (
      newObj.hasOwnProperty(key) &&
      oldObj[key] !== newObj[key]
    ) {
      changes.push(
        `${key} from ${oldObj[key]} to ${newObj[key]}`,
      );
    }
  }

  if (changes.length > 0) {
    console.log(
      `${newObj["domain"]} changed ${changes.join(" and ")}`,
    );
  } else {
    console.log("No changes detected.");
  }
}
