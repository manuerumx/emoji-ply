"use strict";

const CONSTANT = require("./GitHubConstants");
const Utils = require("../../../utils/Utils");
const ARCHITECTS = ["manuerumx"];
const SENSITIVE_FILES = ["package.json"];
const SENSITIVE_PATHS = ["app/sensitive"];
const SENSITIVE_LABELS = ["bug", "needs rebase", "error", "needs help"];


class GitHubValidator {

  static _hasRequestedChanges(reviews) {
    let requestedChanges = [];

    reviews.forEach((review) => {
      let alreadyListed = requestedChanges.includes(review.author);

      if (review.state === CONSTANT.APPROVED && alreadyListed) {
        requestedChanges.splice(requestedChanges.indexOf((review.author)), 1);
      }

      if (review.state === CONSTANT.REQUESTED_CHANGES && !alreadyListed) {
        requestedChanges.push(review.author);
      }
    });

    return requestedChanges.length > 0;
  }

  static _hasReviewByArchitect(reviews) {
    return reviews.reduce((isArchitect, review) => {
      return isArchitect || GitHubValidator._isAnArchitect(review.author);
    }, false);
  }

  static _hasReviewByArchitectAfterPush(reviews, commitDate) {
    let hasReview = reviews.filter((review) => {
      return new Date(review.createdAt) >= new Date(commitDate) && review.state === CONSTANT.APPROVED && GitHubValidator._isAnArchitect(review.author);
    });
    return hasReview.length >= 1;
  }

  static _hasPushedAfterReview(reviews, commitDate) {
    let hasPushed = false;
    reviews.forEach((review) => {
      hasPushed = new Date(commitDate) > new Date(review.createdAt);
    });
    return hasPushed;
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
    return SENSITIVE_PATHS.some((fl) => file.indexOf(fl) !== -1);
  }

  static _hasSensitiveLabels(labels) {
    return Utils.isSomeInOtherArray(SENSITIVE_LABELS, labels);
  }
}

module.exports = GitHubValidator;
