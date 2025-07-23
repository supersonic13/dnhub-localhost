// const wordList = require("./words");
// const splitRegex = new RegExp("[^a-zA-Z0-9']+", "g");
// // const FILE_WORDS = require("./words");

// let maxWordLen = 0;
// let wordCost = {};
// let maxCost = 9e999;

/**
 * WordsNinja, Split your string text without space to english words
 * @class
 */
class WordsNinja {
  constructor() {
    this.wordList = require("./words");
    this.splitRegex = new RegExp("[^a-zA-Z0-9']+", "g");
    this.maxWordLen = 0;
    this.wordCost = {};
    this.maxCost = 9e999;
    this.loaded = false;
  }

  /**
   * Load Dictionary
   * @return {Object} Objects of dictionary
   */
  async loadDictionary() {
    if (this.loaded) return this.wordCost;
    let words = this.wordList?.split("\n");
    words.forEach((word, index) => {
      this.wordCost[word] = Math.log((index + 1) * Math.log(words.length));
      if (word.length > this.maxWordLen) this.maxWordLen = word.length;
      if (this.wordCost[word] < this.maxCost)
        this.maxCost = this.wordCost[word];
    });
    this.loaded = true;
    return this.wordCost;
  }

  /**
   * @param {string} string - The string for split
   * @param {object} options - The Options
   * @param {boolean} options.camelCaseSplitter - Split by Camel Case, Default false (optional)
   * @param {boolean} options.capitalizeFirstLetter - Capitalize First Letter, Default false (optional)
   * @param {boolean} options.joinWords - Return join words as sentence, Default false (optional)
   * @returns {Array|string} result - Split String
   */
  splitSentence(
    string,
    {
      camelCaseSplitter = false,
      capitalizeFirstLetter = false,
      joinWords = false,
    } = {}
  ) {
    let list = [];
    if (camelCaseSplitter) string = this.camelCaseSplitter(string);
    string.split(this.splitRegex).forEach((sub) => {
      this.splitWords(sub).forEach((word) => {
        word = capitalizeFirstLetter ? this.capitalizeFirstLetter(word) : word;
        list.push(word);
      });
    });
    return joinWords ? list.join(" ") : list;
  }

  /**
   * Split Words
   * @private
   * @param {string} s Input String
   * @return {Array} Splited Words
   */
  splitWords(s) {
    s = s.toLowerCase();
    let cost = [0];
    const { maxWordLen, wordCost } = this;
    function best_match(i) {
      let candidates = cost.slice(Math.max(0, i - maxWordLen), i).reverse();
      let minPair = [Number.MAX_SAFE_INTEGER, 0];
      candidates.forEach((c, k) => {
        let ccost =
          wordCost[s.substring(i - k - 1, i)] || Number.MAX_SAFE_INTEGER;
        ccost += c;
        if (ccost < minPair[0]) minPair = [ccost, k + 1];
      });
      return minPair;
    }
    for (let i = 1; i < s.length + 1; i++) {
      cost.push(best_match(i)[0]);
    }
    let out = [];
    let i = s.length;
    while (i > 0) {
      let [c, k] = best_match(i);
      let newToken = true;
      if (s.slice(i - k, i) != "'") {
        if (out.length > 0) {
          let last = out[out.length - 1];
          if (
            last == "'s" ||
            (Number.isInteger(s[i - 1]) && Number.isInteger(last?.[0]))
          ) {
            out[out.length - 1] = s.slice(i - k, i) + last;
            newToken = false;
          }
        }
      }
      if (newToken) out.push(s.slice(i - k, i));
      i -= k;
    }
    return out.reverse();
  }

  /**
   * Camel Case Splitter
   * Based on 'split-camelcase-to-words' package, https://www.npmjs.com/package/split-camelcase-to-words
   * @private
   * @param {string} inputString
   * @return {string} String
   */
  camelCaseSplitter(inputString) {
    let notNullString = inputString || "";
    let trimmedString = notNullString.trim();
    let arrayOfStrings = trimmedString.split(" ");
    let splitStringsArray = [];
    arrayOfStrings.forEach((tempString) => {
      if (tempString != "") {
        let splitWords = tempString.split(/(?=[A-Z])/).join(" ");
        splitStringsArray.push(splitWords);
      }
    });
    return splitStringsArray.join(" ");
  }

  /**
   * Capitalize First Letter
   * @private
   * @param {string} string - String to Capitalize First Letter
   * @return {string} result
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// export default WordsNinja;
module.exports = WordsNinja;
