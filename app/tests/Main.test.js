"use strict";

const Main = require("../Main");
const fs = require("fs");

test("Should run the entire process", () => {
  expect(Main.morph()).toBe("Works");
});

test("Should create a lock file", () => {
  let lock_file = Main.getLockFilePath();
  let fp = Main.ensureLockFileExists(lock_file);

  expect(fs.existsSync(lock_file)).toBeTruthy();

  Main.unLockFile(fp);
  expect(fs.existsSync(lock_file)).toBeFalsy();
});

test("Should throw an error when a lock file already exists", () => {
  let lock_file = Main.getLockFilePath();
  let fp = Main.ensureLockFileExists(lock_file);

  expect(() => {
    Main.ensureLockFileExists(lock_file);
  }).toThrow("Unable to lock Emoji-ply");

  Main.unLockFile(fp);
  expect(fs.existsSync(lock_file)).toBeFalsy();
});

function deleteLockFileForTests() {
  const lock_file_for_tests = Main.getLockFilePath();
  if (fs.existsSync(lock_file_for_tests)) {
    fs.unlinkSync(lock_file_for_tests);
  }
}

beforeEach(() => {
  deleteLockFileForTests();
});

afterEach(() => {
  deleteLockFileForTests();
});

