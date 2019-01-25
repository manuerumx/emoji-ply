"use strict";

class GitHubParser {

  static parseLabels(githubData) {
    return githubData.reduce((accumulator, current) => {
      accumulator.push(current.name);
      return accumulator;
    }, []).filter((lb) => typeof lb !== "undefined");
  }

  static parseReviews(githubData) {
    return githubData.map((review) => {
      return {
        "author": review.author.login,
        "state": review.state,
        "createdAt": review.createdAt,
      };
    });
  }

  static parseChecks(githubData) {
    if (githubData.total_count === 0) {
      return {
        "status": "Undefined",
        "conclusion": "Undefined"
      };
    }

    let last_run = githubData.check_runs[0];
    return {
      "status": last_run.status,
      "conclusion": last_run.conclusion
    };
  }

  static parseFiles(githubData) {
    return githubData.reduce((accumulator, current) => {
      accumulator.push(current.path);
      return accumulator;
    }, []).filter((fl) => typeof fl !== "undefined");
  }

  static extractInfoFromLastCommit(githubData) {
    let hashedCommit = Buffer.from(githubData.commits.nodes[0].id, "Base64").toString();
    let commitArray = hashedCommit.split(":");
    let reversedArray = commitArray.reverse();
    return reversedArray[0];
  }

  static extractLastCommitDate(githubData) {
    return githubData.commits.nodes[0].commit.pushedDate;
  }
}

module.exports = GitHubParser;
