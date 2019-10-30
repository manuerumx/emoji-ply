"use strict";

const PullRequest = require("../PullRequest");
const PullRequestValidator = require("../PullRequestValidator");
const GitHubValidator = require("./GitHubValidator");
const CONSTANT = require("./GitHubConstants");

class GitHubPullRequestFactory {
  /**
   *
   * @param info
   * @param files
   * @param reviews
   * @param checks
   * @param labels
   * @param commitPushedAt
   * @returns {PullRequest}
   */
  static buildPullRequestFromGithub(info, files, reviews, checks, labels, commitPushedAt) {
    let instance = new PullRequest();

    if (Object.keys(info).length > 0) {
      instance.isFoundOnRemote = true;
      instance.isMerged = info.merged;
      instance.author = info.author.login;
      instance.url = info.url;
      instance.branch = info.headRefName;
      instance.targetBranch = info.baseRefName;
      instance.isClosed = info.closed;
      instance.hasCiApproval = checks.conclusion === CONSTANT.CHECKS_SUCCESS_CONCLUSION;
      instance.isSensitive = GitHubValidator._hasSensitiveFilesAltered(files);
      instance.hasReviewByArchitect = GitHubValidator._hasReviewByArchitect(reviews);
      instance.hasReviewByArchitectAfterPush = GitHubValidator._hasReviewByArchitectAfterPush(reviews, commitPushedAt);
      instance.hasRequestedChanges = GitHubValidator._hasRequestedChanges(reviews);
      instance.hasReviews = reviews.length > 0;
      instance.hasConflicts = info.mergeable === CONSTANT.STATUS_CONFLICTING;
      instance.hasPushAfterReview = GitHubValidator._hasPushedAfterReview(reviews, commitPushedAt);
      instance.commitPushedAt = commitPushedAt;
      instance.hasLabels = GitHubValidator._hasSensitiveLabels(labels);

      [instance.canBeMerged, instance.reason] = PullRequestValidator.checkCanBeMerged(instance);
    } else {
      instance.isFoundOnRemote = false;
      instance.reason = "The requested pull cannot be found";
    }

    return instance;
  }
}

module.exports = GitHubPullRequestFactory;
