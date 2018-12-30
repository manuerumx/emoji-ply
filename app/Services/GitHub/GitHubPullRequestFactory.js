'use strict';

const PullRequest = require('../../PullRequest');
const GitHubValidator = require('./GitHubValidator');
const CONSTANT = require('./GitHubConstants');

class GitHubPullRequestFactory {

  static buildPullRequestFromGithub(info, files, reviews, checks, labels) {
    let instance = new PullRequest();
    instance.isMerged = info.merged;
    instance.author = info.author;
    instance.url = info.url;
    instance.branch = info.headRefName;
    instance.target = info.baseRefName;
    instance.isClosed = info.closed;
    instance.hasCiApproval = checks.conclusion === CONSTANT.CHECKS_SUCCESS_CONCLUSION;
    instance.isSensitive = GitHubValidator._hasSensitiveFilesAltered(files);
    instance.hasReviewByArchitect = GitHubValidator._hasReviewByArchitect(reviews);
    instance.hasReviewByArchitectAfterPush = false;
    instance.hasRequestedChanges = GitHubValidator._hasRequestedChanges(reviews);
    instance.hasReviews = reviews.length > 0;
    instance.hasConflicts = info.mergeable === CONSTANT.STATUS_CONFLICTING;
    instance.hasPushAfterReview = false;
    instance.commitPushedAt = info.commitPushedAt;
    instance.hasLabels = GitHubValidator._hasSensitiveLabels(labels);

    instance.canBeMerged = true;
    instance.reason = '';

    return instance;
  }
}

module.exports = GitHubPullRequestFactory;
