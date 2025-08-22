const FetchDomains = require("./FetchDomains");
const ProcessDomains = require("./ProcessDomains");

async function AutoCatchInterval() {
  async function runInterval() {
    const domains = await FetchDomains();
    if (domains?.domains?.length > 0 && domains?.enable) {
      await ProcessDomains(domains?.domains);
    }

    setTimeout(runInterval, 5000);
  }

  // Start the interval
  setTimeout(runInterval, 5000);
}

module.exports = AutoCatchInterval;
