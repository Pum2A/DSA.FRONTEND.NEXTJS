module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // lub <rootDir>/app/$1 jeśli wszystko jest w app/
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  verbose: true,
};
