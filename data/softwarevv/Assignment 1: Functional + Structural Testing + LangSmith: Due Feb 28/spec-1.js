module.exports = {
  dictionary: [
    "a",
    "ab",
    "bab",
    "bc",
    "bca",
    "c",
    "caa"
  ],
  example: {
    text: "abccab",
    expected: [
      { pattern: "a", endIndex: 1 },
      { pattern: "ab", endIndex: 2 },
      { pattern: "bc", endIndex: 3 },
      { pattern: "c", endIndex: 3 },
      { pattern: "c", endIndex: 4 },
      { pattern: "a", endIndex: 5 },
      { pattern: "ab", endIndex: 6 }
    ]
  }
};