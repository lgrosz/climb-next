module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.(j|t)sx?$": ["babel-jest",{}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
