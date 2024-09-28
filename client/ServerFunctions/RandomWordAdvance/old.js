const axios = require("axios");
const WordPOS = require("wordpos");
const wordpos = new WordPOS();
const wordList = require("./words");

async function getRandomItems(copy, numItems) {
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, numItems);
}
const upperCase = (array) =>
  array
    .map((x) => x?.slice(0, 1)?.toUpperCase()?.concat(x?.slice(1)))
    .filter((y) => !/[-_.'"/()]/.test(y))
    .filter((z) => z);

const RandomWordsAdvance = async ({ words, ext }, socket) => {
  const adjectives = await wordpos
    .getAdjectives(wordList.split("\n"))
    .then((res) => upperCase(res));

  const adj = await getRandomItems(adjectives, 300);

  const nouns = await wordpos
    .randNoun({ startsWith: "", count: 300 })
    .then((res) => upperCase(res));

  const adverbs = await wordpos
    .randAdverb({ startsWith: "", count: 300 })
    .then((res) => upperCase(res));

  const verbs = await wordpos
    .randVerb({ startsWith: "", count: 300 })
    .then((res) => upperCase(res));

  const combined = adj.map((x, i) => x + nouns[i]);
  console.log(nouns);
  if (
    ["com", "net", "org", "info", "cc", "biz", "xyz"].filter((x) => x == ext)
      .length > 0
  ) {
    const params = {
      names: combined.toString(), //words?.map((x) => x.domain).toString(),
      tlds: ext,
      "include-registered": true,
    };
    const headers = {
      "X-NAMESUGGESTION-APIKEY": "9da54da3649dfbc297d8204899ec33e6",
    };
    axios
      .get("https://sugapi.verisign-grs.com/ns-api/2.0/bulk-check?", {
        params,
        headers,
      })
      .then((respond) => {
        socket.emit(
          "random-words-advance",
          respond.data?.results?.map((x) => ({
            name: x?.name,
            availability: x?.availability,
            keywords: words
              ?.filter((y) => y?.domain === x?.name?.split(".")[0])
              ?.map((z) => z?.keywords)
              .toString(),
          }))
        );
      })
      .catch((err) => {
        console.log(err?.response?.data);
      });
  } else {
    const domains = words
      ?.mapt((a) => a.domain)
      .map((x) => x.concat("." + ext));

    const headers = {
      Authorization:
        "sso-key 3mM44UbgSaTnZa_k8GxyWC81cL93ub4i1FzV:UoKmqiHd1myEoSpqgC8rAQ",
    };
    axios
      .post(
        `https://api.ote-godaddy.com/v1/domains/available?checkType=FULL`,
        domains,
        { headers }
      )
      .then((respond) => {
        socket.emit(
          "random-words-advance",
          respond.data.domains.map((x) => ({
            name: x.domain,
            availability: x.available ? "available" : "registered",
          }))
        );
      })
      .catch((err) => {
        console.log(err);
        socket.emit("random-words-advance", [
          {
            name: "Too Many Request. please try again",
            availability: "available",
          },
        ]);
      });
  }
};

module.exports = RandomWordsAdvance;
