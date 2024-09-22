const client = require("../../db");
const axios = require("axios");
const soap = require("soap");

const fetchDomains = require("./fetchDomains");
const processDomains = require("./processDomains");
const sedoUrl = "https://api.sedo.com/api/v1/?wsdl";

async function DnsMonitoringInterval() {
  async function runInterval() {
    const domains = await fetchDomains();

    await processDomains(domains);

    console.log("Waiting for next 10-second interval...");
    setTimeout(runInterval, 10000);
  }

  // Start the interval
  setTimeout(runInterval, 10000);
}

module.exports = DnsMonitoringInterval;
