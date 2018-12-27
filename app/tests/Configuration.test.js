'use strict';

const Configuration = require('../Configuration');

describe('Test load configuration from Array/ENV', () => {
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

  test('Load environment variable', () => {
    let n = new Configuration();
    expect(n.getEnvironment([])).toBe('test');
  });


  test('Fail load environment variable', () => {
    let n = new Configuration();
    expect(() => {
      n.getVariable('foo');
    }).toThrow('Unable to find the variable');
  });

  test('Load custom variables from array', () => {
    let service = [
      "MOCKED_ENV=Abc123",
      "FOO=Bar",
      "HELLO=World",
    ];
    let n = new Configuration(service);
    expect(n.getEnvironment([])).toBe('test');
    expect(n.getVariable("MOCKED_ENV")).toBe("Abc123");
    expect(n.getVariable("FOO")).toBe("Bar");
    expect(n.getVariable("HELLO")).toBe("World");
  });

  test('Load custom variables from ENV', () => {
    let service = [
      "MOCKED_ENV=###",
      "FOO=###",
      "HELLO=###",
    ];
    loadFakeEnv();
    let n = new Configuration(service);
    expect(n.getEnvironment([])).toBe('test');
    expect(n.getVariable("MOCKED_ENV")).toBe("Abc123");
    expect(n.getVariable("FOO")).toBe("Bar");
    expect(n.getVariable("HELLO")).toBe("World");
  });

  test('Load custom variables from mixed origin (env and array)', () => {
    let service = [
      "MOCKED_ENV=###",
      "FOO=###",
      "HELLO=###",
      "NYAN=Cat",
    ];
    loadFakeEnv();
    let n = new Configuration(service);
    expect(n.getEnvironment([])).toBe('test');
    expect(n.getVariable("MOCKED_ENV")).toBe("Abc123");
    expect(n.getVariable("FOO")).toBe("Bar");
    expect(n.getVariable("HELLO")).toBe("World");
    expect(n.getVariable("NYAN")).toBe("Cat");
  });

  test('Load custom variables from two arrays', () => {
    let service = [
      "MOCKED_ENV=Abc123",
      "FOO=Bar",
    ];
    let service2 = [
      "HELLO=World",
    ];
    let n = new Configuration(service, service2);
    expect(n.getEnvironment([])).toBe('test');
    expect(n.getVariable("MOCKED_ENV")).toBe("Abc123");
    expect(n.getVariable("FOO")).toBe("Bar");
    expect(n.getVariable("HELLO")).toBe("World");
  });

  function loadFakeEnv() {
    process.env.MOCKED_ENV = 'Abc123';
    process.env.FOO = 'Bar';
    process.env.HELLO = 'World';
  }
});
