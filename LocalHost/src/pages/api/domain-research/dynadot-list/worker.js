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
  const allPos = [];
  chunk.forEach((domain) => {
    const domainName = domain?.Domain?.toLowerCase();
    const dn = domainName?.split(".")?.[0];
    const words = WordsNinja.splitSentence(dn, { capitalizeFirstLetter: true });

    allWords.push(...words);

    const posDoc = nlp.readDoc(words.join(" "));
    const pos = posDoc
      .tokens()
      .filter((t) => t.out(its.type) === "word")
      .out(its.pos);

    allPos.push(pos);

    allDomains.push({
      domain: domainName,
      keyword: dn,
      tld: domainName?.split(".")?.slice(1).join("."),
      onlyWord: /^[a-zA-Z]+$/.test(dn),
      containNumber: /[a-zA-Z]/.test(dn) && /\d/.test(dn),
      onlyNumber: /^[0-9]+$/.test(dn),
      hyphenated: /-/.test(dn),
      splittedWords: words,
      wordsCount: words.length,
      length: dn?.length,
      auctionEndTime: domain?.["End Time"],
      visitors: domain?.Visitors,
      domainAge: domain?.Age,
      estibotAppraisal:
        domain?.["Estibot Appraisal"] ||
        domain?.Appraisal ||
        domain?.Dynappraisal,
      backLinks: domain?.Links,
      monthlyParkingRevenue: domain?.Revenue,
      bidPrice: domain?.["Bid Price"],
      numberOfBids: domain?.Bids,
      seller: domain?.Seller,
      currentBid: domain?.["Current bid"],
      valuation: domain?.valuation,
      pos,
    });
  });
  // const doc = nlp.readDoc(allWords.join(" "));
  // const wordsCount = doc
  //   .tokens()
  //   .filter((t) => t.out(its.type) === "word")
  //   .out(its.value, as.freqTable);

  const wordFreq = {};
  for (const word of allWords) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  const wordsCount = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);

  parentPort.postMessage({ allDomains, allWords, wordsCount, allPos }); // Send the results to the main thread
})();
