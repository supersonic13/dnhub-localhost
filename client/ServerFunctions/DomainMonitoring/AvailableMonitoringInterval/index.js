const fetchDomains = require("./fetchDomains");
const processDomains = require("./processDomains");

async function AvailableMonitoringInterval() {
  async function runInterval() {
    const domains = await fetchDomains();

    await processDomains(domains);

    console.log("Waiting for next 10-second interval...");
    setTimeout(runInterval, 10000);
  }

  // Start the interval
  setTimeout(runInterval, 10000);
}

module.exports = AvailableMonitoringInterval;
