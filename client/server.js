const express = require("express");
const next = require("next");
const http = require("http"); // Required for socket.io integration
const { Server } = require("socket.io");
const port = parseInt(process.env.PORT, 10) || 5000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const cors = require("cors");

const DevelopedSiteChecker = require("./ServerFunctions/DevelopedSiteChecker");

const NewsHeadLines = require("./ServerFunctions/NewsTrends/NewsHeadLines");
const NewsContent = require("./ServerFunctions/NewsTrends/NewsContent");
const SaveKanban = require("./ServerFunctions/Kanban/SaveKanban");
const GetKanban = require("./ServerFunctions/Kanban/GetKanban");
const NameCheapDropCatch = require("./ServerFunctions/DropCatch/NameCheap");
const DynadotDropCatch = require("./ServerFunctions/DropCatch/Dynadot");
const GodaddyDropCatch = require("./ServerFunctions/DropCatch/Godaddy");
const NameSiloDropCatch = require("./ServerFunctions/DropCatch/NameSilo");
const TldBasedWords = require("./ServerFunctions/DomainAnalyze/TldBasedWords");
const PriceMonitoringInterval = require("./ServerFunctions/DomainMonitoring/PriceMonitoringInterval");
const DnsMonitoringInterval = require("./ServerFunctions/DomainMonitoring/DnsMonitoringInterval");
const AvailableMonitoringInterval = require("./ServerFunctions/DomainMonitoring/AvailableMonitoringInterval");
const StatusMonitoringInterval = require("./ServerFunctions/DomainMonitoring/StatusMonitoringInterval");
const BulkWhois = require("./ServerFunctions/BulkWhois");
const {
  default: BulkDomainVolume,
} = require("./ServerFunctions/BulkDomainVolume");
const RandomWordsAdvance = require("./ServerFunctions/RandomWordAdvance");

const createServer = async () => {
  await app.prepare();

  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  server.use(express.static("public"));
  var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  server.use(cors(corsOptions));
  server.use(express.json({ limit: "5000mb" }));
  server.use(
    express.urlencoded({
      extended: false,
      limit: "5000mb",
      parameterLimit: 50000000,
    })
  );

  /* ------Price Monitoring Function---------*/
  // PriceMonitoringInterval();
  /* ------Price Monitoring Function---------*/

  /* ------Dns Monitoring Function---------*/
  // DnsMonitoringInterval();
  /* ------Dns Monitoring Function---------*/

  /* ------Dns Monitoring Function---------*/
  // AvailableMonitoringInterval();
  /* ------Dns Monitoring Function---------*/

  /* ------Dns Monitoring Function---------*/
  // StatusMonitoringInterval();
  /* ------Dns Monitoring Function---------*/

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("tld-based-words", (tld) => {
      TldBasedWords(socket, tld);
    });
    socket.on("news-headlines", (topic) => {
      NewsHeadLines(socket, topic);
    });
    socket.on("news-content", (content) => {
      NewsContent(socket, content);
    });
    socket.on("save-kanban", (data) => {
      SaveKanban(socket, data);
    });

    socket.on("get-kanban-data", (data) => {
      GetKanban(socket, data);
    });
    socket.on("bulk-domain-volume", (domain) => {
      BulkDomainVolume(socket, domain);
    });
    socket.on("bulk-whois", ({ domain }) => BulkWhois(socket, domain));
    socket.on("namecheap-dropcatch", (domain) =>
      NameCheapDropCatch(socket, domain)
    );
    socket.on("dynadot-dropcatch", (domain) =>
      DynadotDropCatch(socket, domain)
    );
    socket.on("namesilo-dropcatch", (domain) =>
      NameSiloDropCatch(socket, domain)
    );
    socket.on("godaddy-dropcatch", (domain) =>
      GodaddyDropCatch(socket, domain)
    );
    socket.on("developed-site-checker", ({ domain }) => {
      DevelopedSiteChecker(socket, domain);
    });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
    socket.on("random-words-advance", ({ words, ext }) => {
      RandomWordsAdvance({ words, ext }, socket);
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  return httpServer;
};

module.exports = createServer;
