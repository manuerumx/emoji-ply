"use strict";

const Configuration = require("../Configuration");
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...OLD_ENV
  };
  delete process.env.MOCKED_ENV;
  delete process.env.FOO;
  delete process.env.HELLO;
  delete process.env.NYAN;
});

afterEach(() => {
  process.env = OLD_ENV;
});

test("Load environment variable", () => {
  let config = new Configuration();
  expect(config.getEnvironment([])).toBe("test");
  expect(config.services).toEqual([]);
});


test("Fail load environment variable", () => {
  let config = new Configuration();

  expect(() => {
    config.getVariable("foo");
  }).toThrow("Unable to find the variable");
});

test("Load custom variables from array", () => {
  let service = [
    "MOCKED_ENV=Abc123",
    "FOO=Bar",
    "HELLO=World",
  ];
  let config = new Configuration(service);

  assertResults(config);
});

test("Load custom variables from ENV", () => {
  let service = [
    "MOCKED_ENV=###",
    "FOO=###",
    "HELLO=###",
  ];
  loadFakeEnv();
  let config = new Configuration(service);

  assertResults(config);
});

test("Load custom variables from mixed origin (env and array)", () => {
  let service = [
    "MOCKED_ENV=###",
    "FOO=###",
    "HELLO=###",
    "NYAN=Cat",
  ];
  loadFakeEnv();
  let config = new Configuration(service);

  assertResults(config);
  expect(config.getVariable("NYAN")).toBe("Cat");
});

test("Load custom variables from two arrays", () => {
  let service = [
    "MOCKED_ENV=Abc123",
    "FOO=Bar",
  ];

  let service2 = [
    "HELLO=World",
  ];
  let config = new Configuration(service, service2);

  assertResults(config);
});

test("Try to load malformed env variables", () => {
  let config = new Configuration(["foo"]);

  expect(() => {
    config.getVariable("foo");
  }).toThrow("Unable to find the variable");
});

function assertResults(n) {
  expect(n.getEnvironment()).toBe("test");
  expect(n.getVariable("MOCKED_ENV")).toBe("Abc123");
  expect(n.getVariable("FOO")).toBe("Bar");
  expect(n.getVariable("HELLO")).toBe("World");
}

function loadFakeEnv() {
  process.env.MOCKED_ENV = "Abc123";
  process.env.FOO = "Bar";
  process.env.HELLO = "World";
}
