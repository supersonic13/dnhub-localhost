import WordsNinjaPack from "./lib/wordsNinja.js";
import fs from "fs";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const WordsNinja = new WordsNinjaPack();

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

export default async function TldBasedWords(socket, tld) {
  const allDomains = [];
  const allWords = [];

  // console.log(tld);
  try {
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
  } catch (error) {
    console.log(error);
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
