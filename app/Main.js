"use strict";

const os = require("os");
const fs = require("fs");

const LOCK_FILE = "emoji-ply-run";

class Main {

  static morph() {
    let result = "";
    let fp = this.tryToLock();
    try {
      result = this.runMorpher();
    } finally {
      this.unLockFile(fp);
      return result;
    }
  }

  static runMorpher() {
    return "Works";
  }

  static tryToLock() {
    const lock_file = Main.getLockFilePath();
    return this.ensureLockFileExists(lock_file);
  }

  static ensureLockFileExists(lock_file) {
    if (fs.existsSync(lock_file)) {
      throw "Unable to lock Emoji-ply";
    }

    let lock_fp = fs.openSync(lock_file, "w");
    if (!lock_fp) {
      throw "Unable to lock Emoji-ply";
    }

    return lock_fp;
  }

  static getLockFilePath() {
    return os.tmpdir() + "/" + LOCK_FILE;
  }

  static unLockFile(fp) {
    fs.closeSync(fp);
    fs.unlinkSync(this.getLockFilePath());
  }
}

module.exports = Main;
