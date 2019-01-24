"use strict";

const PullRequest = require("./PullRequest");
const CONSTANT = require("./GitHub/GitHubConstants");

class PullRequestValidator {

  /**
   * @param {PullRequest} pullRequest
   * @returns {*[]}
   */
  static checkCanBeMerged(pullRequest) {

    if (pullRequest.targetBranch !== "master") {
      return [false, "The pull request is not targeting to master branch"];
    }

    if (pullRequest.isMerged) {
      return [false, "The pull request is already merged"];
    }

    if (pullRequest.isClosed) {
      return [false, "The pull request is closed"];
    }

    if (!pullRequest.hasReviews) {
      return [false, "The pull request need a review from another developer"];
    }

    if (pullRequest.isSensitive && !pullRequest.hasReviewByArchitect) {
      return [false, "The pull request modifies sensitive files and is required the review of an architect"];
    }

    if (pullRequest.hasRequestedChanges) {
      return [false, "The pull request has changes requested"];
    }

    if (pullRequest.hasConflicts) {
      return [false, "The pull request has conflicts that must be resolved"];
    }

    if (!pullRequest.hasCiApproval) {
      return [false, "CI suite reported failures"];
    }

    if (pullRequest.hasPushAfterReview) {
      return [false, "The pull request includes a commit after the last review"];
    }

    if (pullRequest.isSensitive && !pullRequest.hasReviewByArchitectAfterPush) {
      return [false, "The pull request modifies sensitive files and is required the review of an architect after the last push"];
    }

    if (PullRequestValidator.daysSincePush(pullRequest) > CONSTANT.MAX_DAYS_ALLOWED_FOR_COMMIT) {
      return [false, "The pull request is too old"];
    }

    return [true, ""];
  }

  /**
   * @param {PullRequest} pullRequest
   * @returns {number}
   */
  static daysSincePush(pullRequest) {
    let commitDate = new Date(pullRequest.commitPushedAt);
    let requestDate = new Date();
    return Math.floor((requestDate - commitDate) / (1000 * 60 * 60 * 24));
  }
}

module.exports = PullRequestValidator;
