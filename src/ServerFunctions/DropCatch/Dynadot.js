const WhoisLight = require("../../lib");
const axios = require("axios");
const dayjs = require("dayjs");

async function DynadotDropCatch(socket, data) {
  const { domains, api } = data;

  try {
    for (const domain of domains) {
      try {
        const response = await axios.get(
          `https://api.dynadot.com/api3.json?key=${api?.api}&command=register&domain=${domain}&duration=1&currency=USD`,
        );

        socket.emit("dynadot-catched", {
          domain:
            response?.data?.RegisterResponse?.DomainName ||
            domain,
          status:
            response?.data?.RegisterResponse?.Status || "error",
          errorStatus:
            response?.data?.RegisterResponse?.Error ||
            response?.data?.Response?.Error,
          responseCode:
            response?.data?.RegisterResponse?.ResponseCode ||
            response?.data?.Response?.ResponseCode,
          time: dayjs().format("HH:mm:ss.SSS"),
        });
      } catch (err) {
        socket.emit("dynadot-catched", {
          domain,
          status: "error",
          errorStatus: err?.message,
          responseCode: err?.errno,
          time: dayjs().format("HH:mm:ss.SSS"),
        });
      }
    }

    for (const domain of domains) {
      WhoisLight.lookup({ format: true }, domain)
        .then((res) => {
          if (
            domain.toLowerCase().includes(".uk") ||
            domain.toLowerCase().includes(".co.uk")
          ) {
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
