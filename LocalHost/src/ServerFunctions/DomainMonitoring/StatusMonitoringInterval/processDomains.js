const statusMonitoring = require("./status");

async function processDomains(domains) {
  for (let domain of domains) {
    await statusMonitoring(domain);

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
module.exports = processDomains;
