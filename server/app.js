// const express = require("express");
// const http = require("http");
// const app = express();
// const cors = require("cors");
// const client = require("./db");
// const multer = require("multer");
import express from "express";
import http from "http";

import cors from "cors";
// import client from "./db";
import multer from "multer";
const app = express();
// const RandomWords = require("./RandomWord");
// const BulkDomain = require("./BulkDomain");
// const BulkWhois = require("./BulkWhois");
// const OneWordDomain = require("./OneWordDomain");

import DevelopedSiteChecker from "./DevelopedSiteChecker/index.js";
import GoogleTrends from "./GoogleTrends/index.js";
import interestOverTime1 from "./GoogleTrends/interestOverTime1.js";
import interestOverTime2 from "./GoogleTrends/interestOverTime2.js";
import interestOverTime3 from "./GoogleTrends/interestOverTime3.js";
import interestOverTime4 from "./GoogleTrends/interestOverTime4.js";
import interestByRegion from "./GoogleTrends/interestByRegion.js";
import DomainAnalyze from "./DomainAnalyze/DomainAnalyze.js";
import TldBasedWords from "./DomainAnalyze/TldBasedWords.js";
import NewsHeadLines from "./NewsTrends/NewsHeadLines.js";
import NewsContent from "./NewsTrends/NewsContent.js";
import { Server } from "socket.io";
import SaveKanban from "./Kanban/SaveKanban.js";
import GetKanban from "./Kanban/GetKanban.js";
import BulkDomainVolume from "./BulkDomainVolume/index.js";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// const DevelopedSiteChecker = require("./DevelopedSiteChecker");
// const GoogleTrends = require("./GoogleTrends");
// const interestOverTime1 = require("./GoogleTrends/interestOverTime1");
// const interestOverTime2 = require("./GoogleTrends/interestOverTime2");
// const interestOverTime3 = require("./GoogleTrends/interestOverTime3");
// const interestOverTime4 = require("./GoogleTrends/interestOverTime4");

// const interestByRegion = require("./GoogleTrends/interestByRegion");

// const DomainAnalyze = require("./DomainAnalyze/DomainAnalyze");
// const TldBasedWords = require("./DomainAnalyze/TldBasedWords");

// const NewsHeadLines = require("./NewsTrends/NewsHeadLines");
// const NewsContent = require("./NewsTrends/NewsContent");

export const server = http.createServer(app);
// const bcrypt = require("bcryptjs");
// const socket_io = new Server(server, )
const io = new Server(server, {
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
  })
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
  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
  });
});

app.post("/domain-analyze", upload.single("file"), DomainAnalyze);
// app.post("/news-api", NewsHeadLines);

// export server to db.js
// export default server;
