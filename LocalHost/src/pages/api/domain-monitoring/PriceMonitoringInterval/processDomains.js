const nodemailer = require("nodemailer");
const axios = require("axios");
const sedo = require("./sedo");
const afternic = require("./afternic");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "raymundo.gulgowski@ethereal.email",
    pass: "7z2xGXeKuwwytnaVSw",
  },
});

async function processDomains(domains) {
  for (let domain of domains) {
    await sedo(domain, transporter);
    await afternic(domain, transporter);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
module.exports = processDomains;
