'use strict';
const PullRequest = require('./PullRequest');
const CONSTANT = require("./GitHub/GitHubConstants");

class PullRequestValidator {

  /**
   * @param {PullRequest} pull_request
   * @returns {*[]}
   */
  static checkCanBeMerged(pull_request) {

    if (pull_request.targetBranch !== 'master') {
      return [false, 'The pull request is not targeting to master branch'];
    }

    if (pull_request.isMerged) {
      return [false, 'The pull request is already merged'];
    }

    if (pull_request.isClosed) {
      return [false, 'The pull request is closed'];
    }

    if (!pull_request.hasReviews) {
      return [false, 'The pull request need a review from another developer'];
    }

    if (pull_request.isSensitive && !pull_request.hasReviewByArchitect) {
      return [false, 'The pull request modifies sensitive files and is required the review of an architect'];
    }

    if (pull_request.hasRequestedChanges) {
      return [false, 'The pull request has changes requested'];
    }

    if (pull_request.hasConflicts) {
      return [false, 'The pull request has conflicts that must be resolved'];
    }

    if (!pull_request.hasCiApproval) {
      return [false, 'CI suite reported failures'];
    }

    if (pull_request.hasPushAfterReview) {
      return [false, 'The pull request includes a commit after the last review'];
    }

    if (pull_request.isSensitive && !pull_request.hasReviewByArchitectAfterPush) {
      return [false, 'The pull request modifies sensitive files and is required the review of an architect after the last push'];
    }

    if (PullRequestValidator.daysSincePush(pull_request) > CONSTANT.MAX_DAYS_ALLOWED_FOR_COMMIT) {
      return [false, 'The pull request is too old'];
    }

    return [true, ''];
  }

  /**
   * @param {PullRequest} pull_request
   * @returns {number}
   */
  static daysSincePush(pull_request) {
    let commit_date = new Date(pull_request.commitPushedAt);
    let request_date = new Date();
    return Math.floor((request_date - commit_date) / (1000 * 60 * 60 * 24));
  }
}

module.exports = PullRequestValidator;
