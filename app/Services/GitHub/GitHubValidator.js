'use strict';

const CONSTANT = require("./GitHubConstants");
const Utils = require('../../utils/Utils');
const ARCHITECTS = [];
const SENSITIVE_FILES = [];
const SENSITIVE_PATHS = [];
const SENSITIVE_LABELS = [];


class GitHubValidator {

  static _hasRequestedChanges(reviews) {
    let requested_changes = [];

    reviews.forEach((review) => {
      let already_listed = requested_changes.includes(review.author);

      if (review.state === CONSTANT.APPROVED && already_listed) {
        requested_changes.splice(requested_changes.indexOf((review.author)), 1);
      }

      if (review.state === CONSTANT.REQUESTED_CHANGES && !already_listed) {
        requested_changes.push(review.author);
      }
    });

    return requested_changes.length > 0;
  }

  static _hasReviewByArchitect(reviews) {
    return reviews.reduce((is_architect, review) => {
      return is_architect || GitHubValidator._isAnArchitect(review.author);
    }, false);
  }

  static _hasReviewByArchitectAfterPush(reviews, commit_date) {
    let has_review = reviews.filter((review) => {
      return new Date(review.createdAt) >= new Date(commit_date) && review.state === CONSTANT.APPROVED && GitHubValidator._isAnArchitect(review.author);
    });
    return has_review.length >= 1;
  }

  static _hasPushedAfterReview(reviews, commit_date) {
    let commited = new Date(commit_date);
    return reviews.reduce((has_pushed, review) => {
      return has_pushed || commited >= new Date(review.createdAt);
    }, false);
  }

  static _isAnArchitect(user) {
    return ARCHITECTS.includes(user);
  }

  static _hasSensitiveFilesAltered(files) {
    let sensitivePaths = GitHubValidator._areInSensitivePath(files);
    let sensitiveFiles = GitHubValidator._areSensitiveFiles(files);
    return !(!sensitiveFiles && !sensitivePaths);
  }

  static _areSensitiveFiles(files) {
    return Utils.isSomeInOtherArray(files, SENSITIVE_FILES);
  }

  static _areInSensitivePath(files) {
    return files.some(fl => GitHubValidator._isFileInSensitivePath(fl));
  }

  static _isFileInSensitivePath(file) {
    return SENSITIVE_FILES.some(fl => file.indexOf(fl) !== -1);
  }

  static _hasSensitiveLabels(labels) {
    return Utils.isSomeInOtherArray(SENSITIVE_LABELS, labels)
  }
}

module.exports = GitHubValidator;
