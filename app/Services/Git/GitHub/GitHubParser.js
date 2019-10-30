"use strict";

class GitHubParser {
  /**
   *
   * @param githubData
   * @returns {*}
   */
  static parseLabels(githubData) {
    return githubData.reduce((accumulator, current) => {
      accumulator.push(current.name);
      return accumulator;
    }, []).filter((lb) => typeof lb !== "undefined");
  }

  /**
   *
   * @param githubData
   * @returns {Uint8Array|BigInt64Array|{createdAt: *, author: *, state: *}[]|Float64Array|Int8Array|Float32Array|Int32Array|Uint32Array|Uint8ClampedArray|BigUint64Array|Int16Array|Uint16Array}
   */
  static parseReviews(githubData) {
    return githubData.map((review) => {
      return {
        "author": review.author.login,
        "state": review.state,
        "createdAt": review.createdAt,
      };
    });
  }

  /**
   *
   * @param githubData
   * @returns {{conclusion: *, status: *}|{conclusion: string, status: string}}
   */
  static parseChecks(githubData) {
    if (githubData.total_count === 0) {
      return {
        "status": "Undefined",
        "conclusion": "Undefined"
      };
    }

    let lastRun = githubData.check_runs[0];
    return {
      "status": lastRun.status,
      "conclusion": lastRun.conclusion
    };
  }

  /**
   *
   * @param githubData
   * @returns {*}
   */
  static parseFiles(githubData) {
    return githubData.reduce((accumulator, current) => {
      accumulator.push(current.path);
      return accumulator;
    }, []).filter((fl) => typeof fl !== "undefined");
  }

  /**
   *
   * @param githubData
   * @returns {string}
   */
  static extractInfoFromLastCommit(githubData) {
    let hashedCommit = Buffer.from(githubData.commits.nodes[0].id, "Base64").toString();
    let commitArray = hashedCommit.split(":");
    let reversedArray = commitArray.reverse();
    return reversedArray[0];
  }

  /**
   *
   * @param githubData
   */
  static extractLastCommitDate(githubData) {
    return githubData.commits.nodes[0].commit.pushedDate;
  }
}

module.exports = GitHubParser;
