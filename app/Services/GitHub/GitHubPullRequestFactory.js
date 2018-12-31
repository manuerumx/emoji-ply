'use strict';

const PullRequest = require('../../PullRequest');
const GitHubValidator = require('./GitHubValidator');
const CONSTANT = require('./GitHubConstants');

class GitHubPullRequestFactory {

  static buildPullRequestFromGithub(info, files, reviews, checks, labels, commit_pushed_at) {
    let instance = new PullRequest();
    instance.isMerged = info.merged;
    instance.author = info.author.login;
    instance.url = info.url;
    instance.branch = info.headRefName;
    instance.target = info.baseRefName;
    instance.isClosed = info.closed;
    instance.hasCiApproval = checks.conclusion === CONSTANT.CHECKS_SUCCESS_CONCLUSION;
    instance.isSensitive = GitHubValidator._hasSensitiveFilesAltered(files);
    instance.hasReviewByArchitect = GitHubValidator._hasReviewByArchitect(reviews);
    instance.hasReviewByArchitectAfterPush = GitHubValidator._hasReviewByArchitectAfterPush(reviews, commit_pushed_at);
    instance.hasRequestedChanges = GitHubValidator._hasRequestedChanges(reviews);
    instance.hasReviews = reviews.length > 0;
    instance.hasConflicts = info.mergeable === CONSTANT.STATUS_CONFLICTING;
    instance.hasPushAfterReview = GitHubValidator._hasPushedAfterReview(reviews, commit_pushed_at);
    instance.commitPushedAt = commit_pushed_at;
    instance.hasLabels = GitHubValidator._hasSensitiveLabels(labels);

    instance.canBeMerged = true;
    instance.reason = '';

    return instance;
  }
}

module.exports = GitHubPullRequestFactory;
