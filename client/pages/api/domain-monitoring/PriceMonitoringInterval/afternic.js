import axios from "axios";

export default async function afternic(domain, transporter) {
  const afternic = await axios
    .get(
      `https://auctions.godaddy.com/beta/findApiProxy/v4/aftermarket/find/auction/recommend?&query=${domain?.domain}&paginationSize=1&paginationStart=0`,
    )
    .then((response) =>
      response.data?.results?.map((x) =>
        x?.fqdn === domain?.domain
          ? { price: x?.auction_price_usd }
          : { price: 0 },
      ),
    );
  if (afternic?.[0]?.price > 0) {
    if (domain?.afternicPrice != afternic?.[0]?.price) {
      console.log("price changed for ", domain.domain);
      const info = await transporter.sendMail({
        from: "psk pro <pskrpo@gmail.com>", // sender address
        to: "catherine66@ethereal.email", // list of receivers
        subject: `afternic price not change for the domain ", ${domain?.domain}`, // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
      console.log(info);
    } else {
      console.log(
        "afternic price not changed for the domain ",
        domain?.domain,
      );
    }
  }
}
module.exports = afternic;
