"use strict";

class GitHubChecksResponseBuilder {
  constructor(response) {
    return response;
  }

  static get Builder() {

    class Builder {
      constructor() {
        this.checks = [];
      }

      with_check(status, conclusion, completed_at) {
        this.checks.push({
          "status": status,
          "conclusion": conclusion,
          "completed_at": completed_at
        });
        return this;
      }

      build() {
        let response = {
          "total_count": this.checks.length,
          "check_runs": this.checks
        };
        return new GitHubChecksResponseBuilder(response);
      }
    }

    return Builder;
  }

}

module.exports = GitHubChecksResponseBuilder;
