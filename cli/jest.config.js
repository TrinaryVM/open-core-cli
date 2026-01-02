const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/cli/test/**/*.test.ts",
    "**/cli/test/**/*.test.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/test/", // Exclude VSCode extension tests
    "/runtime/",
    "/compiler/"
  ],
  collectCoverageFrom: [
    "cli/src/**/*.ts",
    "!cli/src/**/*.d.ts"
  ]
}; 