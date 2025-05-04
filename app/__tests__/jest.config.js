const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Ścieżka do Next.js app
  dir: "./",
});

// Konfiguracja dla Jesta
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    // Obsługa aliasów z tsconfig.json
    "^@/components/(.*)$": "<rootDir>/app/components/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    // Obsługa plików CSS, obrazów, itp.
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__tests__/mocks/fileMock.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/_*.{js,jsx,ts,tsx}",
    "!app/**/*.stories.{js,jsx,ts,tsx}",
    "!app/api/**/*",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// Eksport połączonej konfiguracji
module.exports = createJestConfig(customJestConfig);
