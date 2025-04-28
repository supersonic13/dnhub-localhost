const WhoisLight = require("whois-light");
const axios = require("axios");
const { client } = require("../../db");

async function DynadotDropCatch(socket, data) {
  // console.time("drop-catch");
  // 9F8y639W7M6P8l7chFy8sLy6y7f7CE9G8AY9UQE
  const { domains } = data;
  try {
    const api = await client
      .db("localhost-server")
      .collection("dynadot-api")
      .findOne({});
    for (const domain of domains) {
      axios
        .get(
          `https://api.dynadot.com/api3.json?key=${api?.api}&command=register&domain=${domain}&duration=1&currency=USD`
        )
        .then((res) => {
          socket.emit("dynadot-catched", {
            domain,
            status: res.data?.RegisterResponse?.Status,
            errorStatus: res.data?.RegisterResponse?.Status,
            responseCode: res.data?.RegisterResponse?.ResponseCode,
          });
        })
        .catch((err) => console.log(err));
    }

    for (const domain of domains) {
      WhoisLight.lookup({ format: true }, domain)
        .then((res) => {
          if (domain.toLowerCase().includes(".uk" || ".co.uk")) {
            const raw = res._raw
              .split("\r\n")
              .map((x) => x.split("\n"))
              .join(":")
              .split(":")
              .map((x) => x.trim())
              .filter((x) => x);
            const chunkSize = 2;
            let obj = {};
            let arr = [];
            for (let i = 0; i < raw.length; i += chunkSize) {
              const chunk = raw.slice(i, i + chunkSize);
              arr.push(chunk);
            }
            arr.map((x) => (obj[x[0]] = x[1]));
            socket.emit("dynadot-dropcatch", obj);
            // respond.json(obj);
          } else {
            socket.emit("dynadot-dropcatch", res);
          }
        })
        .catch((err) => console.log(err));
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = DynadotDropCatch;
