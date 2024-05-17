const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const client = require("./db");
const multer = require("multer");
// const RandomWords = require("./RandomWord");
// const BulkDomain = require("./BulkDomain");
// const BulkWhois = require("./BulkWhois");
// const OneWordDomain = require("./OneWordDomain");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const DevelopedSiteChecker = require("./DevelopedSiteChecker");
const GoogleTrends = require("./GoogleTrends");
const interestOverTime1 = require("./GoogleTrends/interestOverTime1");
const interestOverTime2 = require("./GoogleTrends/interestOverTime2");
const interestOverTime3 = require("./GoogleTrends/interestOverTime3");
const interestOverTime4 = require("./GoogleTrends/interestOverTime4");

const interestByRegion = require("./GoogleTrends/interestByRegion");

const DomainAnalyze = require("./DomainAnalyze/DomainAnalyze");
const TldBasedWords = require("./DomainAnalyze/TldBasedWords");

const server = http.createServer(app);
// const bcrypt = require("bcryptjs");

const io = require("socket.io")(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
  },
});
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "5000mb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "5000mb",
    parameterLimit: 50000000,
  }),
);

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  // socket.on("random-words", ({ words, ext }) => {
  //   RandomWords({ words, ext }, socket);
  // });

  // socket.on("bulk-domain", ({ words, ext }) => {
  //   BulkDomain({ words, ext }, socket);
  // });
  // Developed Site Checker
  socket.on("developed-site-checker", ({ domain }) => {
    DevelopedSiteChecker(socket, domain);
  });

  // Google Trends

  socket.on("google-trends", (data) => {
    GoogleTrends(socket, data);
  });
  socket.on("interest-over-time-1", ({ interestOverTimeInput1 }) => {
    interestOverTime1(socket, interestOverTimeInput1);
  });
  socket.on("interest-over-time-2", ({ interestOverTimeInput2 }) => {
    interestOverTime2(socket, interestOverTimeInput2);
  });
  socket.on("interest-over-time-3", ({ interestOverTimeInput3 }) => {
    interestOverTime3(socket, interestOverTimeInput3);
  });

  socket.on("interest-over-time-4", ({ interestOverTimeInput4 }) => {
    interestOverTime4(socket, interestOverTimeInput4);
  });

  socket.on("interest-by-region", ({ interestOverTimeInput1 }) => {
    interestByRegion(socket, interestOverTimeInput1);
  });

  socket.on("tld-based-words", (tld) => {
    TldBasedWords(socket, tld);
  });

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
  });
});

app.post("/domain-analyze", upload.single("file"), (req, res) => {
  DomainAnalyze(req, res);
});

module.exports = server;
