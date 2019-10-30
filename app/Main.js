"use strict";

const os = require("os");
const fs = require("fs");

const LOCK_FILE = "emoji-ply-run";

class Main {
  /**
   *
   * @returns {string}
   */
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

  /**
   *
   * @returns {string}
   */
  static runMorpher() {
    return "Works";
  }

  /**
   *
   * @returns {number}
   */
  static tryToLock() {
    const lockFile = Main.getLockFilePath();
    return this.ensureLockFileExists(lockFile);
  }

  /**
   *
   * @param lockFile
   * @returns {number}
   */
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

  /**
   *
   * @returns {string}
   */
  static getLockFilePath() {
    return os.tmpdir() + "/" + LOCK_FILE;
  }

  /**
   *
   * @param fp
   */
  static unLockFile(fp) {
    fs.closeSync(fp);
    fs.unlinkSync(this.getLockFilePath());
  }
}

module.exports = Main;
