import WordsNinjaPack from "./lib/wordsNinja.js";
import fs from "fs";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import multer from "multer";
const WordsNinja = new WordsNinjaPack();

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  limits: {
    fileSize: 10000000000,
  },
});
export default async function DomainAnalyze(req, res) {
  const allDomains = [];
  const allWords = [];
  console.time("domain");

  try {
    switch (req.method) {
      case "POST":
        upload.single("file")(req, res, async (err) => {
          fs.readFile(`${req.file.path}`, "utf-8", async (err, domains) => {
            err && console.log(err);

            await WordsNinja.loadDictionary();

            domains.split("\n").map((domain) => {
              const dn = domain?.split(".")?.[0];

              //domain.replace(/\d+/g, "").split(".")[0], // remove domains that contain numbers
              const words = WordsNinja.splitSentence(dn, {
                capitalizeFirstLetter: true,
              });

              allWords.push(words);

              allDomains.push({
                domain,
                keyword: dn,
                tld: domain?.split(".")[1],
                onlyWords: /^[a-zA-Z]+$/.test(dn),
                containNumber: /\d/.test(dn),
                numberOnly: /^[0-9]+$/.test(dn),
                hyphenated: /-/.test(dn),
                // onlyNumberAndHyphen: /^[-\d]*-\d*[-\d]*$/.test(dn),
                // onlyAlphabetAndHyphen: /^[a-zA-Z-]+$/.test(dn), // not working
                splittedWords: words, ///[0-9]/.test(dn) ? "" :
                wordsCount: words.length, // /[0-9]/.test(dn) ? "" :
                length: domain?.split(".")?.[0]?.length,
              });
            });

            const doc = nlp.readDoc(allWords.join(" "));
            const pattern = doc
              .tokens()
              .filter(
                (t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag)
              )
              .out(its.value, as.freqTable);

            res.json({ allDomains, pattern });

            console.timeEnd("domain");
          });
        });
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
