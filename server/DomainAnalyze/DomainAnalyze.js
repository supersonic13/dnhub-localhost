const WordsNinjaPack = require("./lib/wordsNinja");
const WordsNinja = new WordsNinjaPack();
const fs = require("fs");
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

async function DomainAnalyze(req, res) {
  const allDomains = [];
  const allWords = [];
  console.time("domain");
  fs.readFile(`${req.file.path}`, "utf-8", async (err, domains) => {
    err && console.log(err);
    await WordsNinja.loadDictionary();

    domains.split("\r\n").map((x) => {
      const words = WordsNinja.splitSentence(
        x.replace(/\d+/g, "").split(".")[0],
        {
          capitalizeFirstLetter: true,
        },
      );
      ///[0-9]/.test(x.split(".")[0]) ? "" :
      allWords.push(words);
      allDomains.push({
        domain: x,
        keyword: x.split(".")[0],
        tld: x.split(".")[1],
        onlyWords: /^[a-zA-Z]+$/.test(x.split(".")[0]),
        containNumber: /\d/.test(x.split(".")[0]),
        numberOnly: /^[0-9]+$/.test(x.split(".")[0]),
        hyphenated: /-/.test(x.split(".")[0]),
        onlyNumberAndHyphen: /^[-\d]*-\d*[-\d]*$/.test(x.split(".")[0]),
        onlyAlphabetAndHyphen: /^[a-zA-Z-]+$/.test(x.split(".")[0]), // not working
        splittedWords: /[0-9]/.test(x.split(".")[0]) ? "" : words,
        wordsCount: /[0-9]/.test(x.split(".")[0]) ? "" : words.length,
      });
    });

    const doc = nlp.readDoc(allWords.join(" "));
    const pattern = doc
      .tokens()
      .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
      .out(its.value, as.freqTable);
    // res.json({ allDomains, pattern: { pattern } });
    // res.json(false);
    res.json({ allDomains, pattern });
    console.timeEnd("domain");
  });
}

module.exports = DomainAnalyze;
