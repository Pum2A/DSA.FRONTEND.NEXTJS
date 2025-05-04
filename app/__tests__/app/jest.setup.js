// Rozszerzenie globalnych matchers z jest-dom
import "@testing-library/jest-dom";

// Mockowanie fetch API
global.fetch = jest.fn();

// Mockowanie localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Wyciszenie ostrzeżeń konsoli podczas testów
console.error = jest.fn();
console.warn = jest.fn();

// Mock dla window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Resetowanie wszystkich mocków po każdym teście
afterEach(() => {
  jest.clearAllMocks();
});
