const { parentPort, workerData } = require("worker_threads");
const WordsNinjaPack = require("./lib/wordsNinja");
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");

const WordsNinja = new WordsNinjaPack();
const nlp = winkNLP(model);
const its = nlp.its;

(async () => {
  await WordsNinja.loadDictionary(); // Load the dictionary once per worker

  const { chunk } = workerData; // Get the chunk of domains to process
  const allDomains = [];
  const allWords = [];
  const allPos = [];
  chunk.forEach((domain) => {
    const domainFields = [
      "Domain",
      "DomainName",
      "Domainname",
      "Domain Name",
      "Domain name",
    ];
    const priceFields = [
      "Price",
      "Prices",
      "price",
      "prices",
      "pricing",
      "Pricing",
    ];
    let domainName = domainFields
      .map((field) => domain?.[field])
      .find(
        (value) => typeof value === "string" && value.length,
      )
      ?.toLowerCase();
    let domainPrice = priceFields
      .map((field) => domain?.[field])
      .find(
        (value) => typeof value === "string" && value.length,
      )
      ?.toLowerCase()
      ?.replace(/[\$,]/g, "");

    const dn = domainName?.split(".")?.[0];
    const words = WordsNinja.splitSentence(dn);

    allWords.push(...words);

    const posDoc = nlp.readDoc(words.join(" "));
    const pos = posDoc
      .tokens()
      .filter((t) => t.out(its.type) === "word")
      .out(its.pos);

    allPos.push(pos);

    allDomains.push({
      domain: domainName,
      price: domainPrice,
      keyword: dn,
      tld: domainName?.split(".")?.slice(1).join("."),
      onlyWord: /^[a-zA-Z]+$/.test(dn),
      containNumber: /\d/.test(dn),
      onlyNumber: /^[0-9]+$/.test(dn),
      hyphenated: /-/.test(dn),
      splittedWords: words,
      wordsCount: words.length,
      length: dn?.length,
      auctionType: domain?.Type,
      pos,
    });
  });

  const wordFreq = {};
  for (const word of allWords) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  const wordsCount = Object.entries(wordFreq).sort(
    (a, b) => b[1] - a[1],
  );

  parentPort.postMessage({
    allDomains,
    allWords,
    wordsCount,
    allPos,
  }); // Send the results to the main thread
})();
