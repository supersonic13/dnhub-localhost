const sedo = require("./sedo");

async function processDomains(domains) {
  for (let domain of domains) {
    await sedo(domain);

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
module.exports = processDomains;
