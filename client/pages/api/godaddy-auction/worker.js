const { parentPort, workerData } = require("worker_threads");
const WordsNinjaPack = require("../domain-analyze/lib/wordsNinja");
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");

const WordsNinja = new WordsNinjaPack();
const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

(async () => {
  await WordsNinja.loadDictionary(); // Load the dictionary once per worker

  const { chunk } = workerData; // Get the chunk of domains to process
  const allDomains = [];
  const allWords = [];

  chunk.forEach((domain) => {
    const dn = domain?.domainName?.split(".")?.[0]?.toLowerCase();
    const words = WordsNinja.splitSentence(dn, { capitalizeFirstLetter: true });

    allWords.push(words);

    allDomains.push({
      domain: domain?.domainName?.toLowerCase(),
      keyword: dn,
      tld: domain?.domainName?.split(".")[1]?.toLowerCase(),
      onlyWord: /^[a-zA-Z]+$/.test(dn),
      containNumber: /\d/.test(dn),
      onlyNumber: /^[0-9]+$/.test(dn),
      hyphenated: /-/.test(dn),
      splittedWords: words,
      wordsCount: words.length,
      length: domain?.domainName?.split(".")[0]?.length,
    });
  });

  const doc = nlp.readDoc(allWords.join(" "));
  const pattern = doc
    .tokens()
    .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
    .out(its.value, as.freqTable);

  parentPort.postMessage({ allDomains, allWords, pattern }); // Send the results to the main thread
})();
