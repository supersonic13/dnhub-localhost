import WordsNinjaPack from "../domain-analyze/lib/wordsNinja";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

import { client } from "../../../db";

const WordsNinja = new WordsNinjaPack();

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

export default async function handler(req, res) {
  const allDomains = [];
  const allWords = [];
  const allPos = [];
  console.time("domain");

  try {
    switch (req.method) {
      case "POST":
        const domains = await client
          .db("localhost-server")
          .collection(req?.body?.value?.label)
          .find()
          .toArray();

        await WordsNinja.loadDictionary();

        domains?.map((domain) => {
          const dn = domain?.domainName?.split(".")?.[0]?.toLowerCase();

          //domain.replace(/\d+/g, "").split(".")[0], // remove domains that contain numbers
          const words = WordsNinja.splitSentence(dn, {
            capitalizeFirstLetter: true,
          });
          allWords.push(words);

          const posDoc = nlp.readDoc(words.join(" "));

          const pos = posDoc
            .tokens()
            .filter((t) => t.out(its.type) === "word")
            .out(its.pos);

          allPos.push(pos);

          allDomains.push({
            domainName: domain?.domainName?.toLowerCase(),
            keyword: dn,
            tld: domain?.domainName?.split(".")[1]?.toLowerCase(),
            onlyWord: /^[a-zA-Z]+$/.test(dn),
            containNumber: /\d/.test(dn),
            onlyNumber: /^[0-9]+$/.test(dn),
            hyphenated: /-/.test(dn),
            splittedWords: words, ///[0-9]/.test(dn) ? "" :
            wordsCount: words.length, // /[0-9]/.test(dn) ? "" :
            length: domain?.domainName?.split(".")?.[0]?.length,
            auctionEndTime: domain?.auctionEndTime,
            auctionType: domain?.auctionType,
            domainAge: domain?.domainAge,
            isAdult: domain?.isAdult,
            link: domain?.link,
            monthlyParkingRevenue: domain?.monthlyParkingRevenue,
            numberOfBids: domain?.numberOfBids,
            pageviews: domain?.pageviews,
            price: domain?.price,
            valuation: domain?.valuation,
            pos,
          });
        });

        const doc = nlp.readDoc(allWords.join(" "));
        const wordsCount = doc
          .tokens()
          .filter((t) => t.out(its.type) === "word")
          .out(its.value, as.freqTable);

        res.json({ wordsCount, allDomains, allPos });

        console.timeEnd("domain");
    }
  } catch (error) {
    console.log(error);
  }
}
export const config = {
  api: {
    externalResolver: true,
  },
};
