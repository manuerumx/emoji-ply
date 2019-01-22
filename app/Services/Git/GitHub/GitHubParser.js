"use strict";

class GitHubParser {

  static parseLabels(github_data) {
    return github_data.reduce((accumulator, current) => {
      accumulator.push(current.name);
      return accumulator;
    }, []).filter(lb => lb !== undefined);
  }

  static parseReviews(github_data) {
    return github_data.map((review) => {
      return {
        "author": review.author.login,
        "state": review.state,
        "createdAt": review.createdAt,
      };
    });
  }

  static parseChecks(github_data) {
    if (github_data.total_count === 0) {
      return {
        "status": "Undefined",
        "conclusion": "Undefined"
      };
    }

    let last_run = github_data.check_runs[0];
    return {
      "status": last_run.status,
      "conclusion": last_run.conclusion
    };
  }

  static parseFiles(github_data) {
    return github_data.reduce((accumulator, current) => {
      accumulator.push(current.path);
      return accumulator;
    }, []).filter(fl => fl !== undefined);
  }

  static extractInfoFromLastCommit(github_data) {
    let hashed_commit = Buffer.from(github_data.commits.nodes[0].id, "Base64").toString();
    let commit_array = hashed_commit.split(":");
    let reversed_array = commit_array.reverse();
    return reversed_array[0];
  }

  static extractLastCommitDate(github_data) {
    return github_data.commits.nodes[0].commit.pushedDate;
  }
}

module.exports = GitHubParser;
