import fetchDomains from "./fetchDomains";
import processDomains from "./processDomains";

export default async function DnsMonitoringInterval() {
  async function runInterval() {
    const domains = await fetchDomains();

    await processDomains(domains);

    console.log("Waiting for next 10-second interval...");
    setTimeout(runInterval, 10000);
  }

  // Start the interval
  setTimeout(runInterval, 10000);
}
