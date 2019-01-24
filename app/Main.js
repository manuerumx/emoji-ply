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
    const lockFile = Main.getLockFilePath();
    return this.ensureLockFileExists(lockFile);
  }

  static ensureLockFileExists(lockFile) {
    if (fs.existsSync(lockFile)) {
      throw "Unable to lock Emoji-ply";
    }

    let lockFp = fs.openSync(lockFile, "w");
    if (!lockFp) {
      throw "Unable to lock Emoji-ply";
    }

    return lockFp;
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
