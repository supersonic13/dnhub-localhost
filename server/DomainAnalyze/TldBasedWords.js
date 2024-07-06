// const WordsNinjaPack = require("./lib/wordsNinja");
// const WordsNinja = new WordsNinjaPack();
// const fs = require("fs");
// const winkNLP = require("wink-nlp");
// const model = require("wink-eng-lite-web-model");
import WordsNinjaPack from "./lib/wordsNinja.js";
import fs from "fs";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const WordsNinja = new WordsNinjaPack();

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

async function TldBasedWords(socket, tld) {
  const allDomains = [];
  const allWords = [];

  // console.log(tld);

  await WordsNinja.loadDictionary();

  tld?.domains?.map((x) => {
    const words = WordsNinja.splitSentence(x?.split(".")[0], {
      capitalizeFirstLetter: true,
    });

    allWords.push(words);
  });
  // console.log(allWords);

  const doc = nlp.readDoc(allWords.join(" "));
  const pattern = doc
    .tokens()
    .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
    .out(its.value, as.freqTable);

  socket.emit("tld-based-words", { pattern });
}

export default TldBasedWords;
