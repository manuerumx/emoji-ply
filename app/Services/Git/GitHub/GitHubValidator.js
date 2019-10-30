"use strict";

const CONSTANT = require("./GitHubConstants");
const Utils = require("../../../utils/Utils");
const ARCHITECTS = ["manuerumx"];
const SENSITIVE_FILES = ["package.json"];
const SENSITIVE_PATHS = ["app/sensitive"];
const SENSITIVE_LABELS = ["bug", "needs rebase", "error", "needs help"];


class GitHubValidator {
  /**
   *
   * @param reviews
   * @returns {boolean}
   * @private
   */
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

  /**
   *
   * @param reviews
   * @returns {*}
   * @private
   */
  static _hasReviewByArchitect(reviews) {
    return reviews.reduce((isArchitect, review) => {
      return isArchitect || GitHubValidator._isAnArchitect(review.author);
    }, false);
  }

  /**
   *
   * @param reviews
   * @param commitDate
   * @returns {boolean}
   * @private
   */
  static _hasReviewByArchitectAfterPush(reviews, commitDate) {
    let hasReview = reviews.filter((review) => {
      return new Date(review.createdAt) >= new Date(commitDate) && review.state === CONSTANT.APPROVED && GitHubValidator._isAnArchitect(review.author);
    });
    return hasReview.length >= 1;
  }

  /**
   *
   * @param reviews
   * @param commitDate
   * @returns {boolean}
   * @private
   */
  static _hasPushedAfterReview(reviews, commitDate) {
    let hasPushed = false;
    reviews.forEach((review) => {
      hasPushed = new Date(commitDate) > new Date(review.createdAt);
    });
    return hasPushed;
  }

  /**
   *
   * @param user
   * @returns {boolean}
   * @private
   */
  static _isAnArchitect(user) {
    return ARCHITECTS.includes(user);
  }

  /**
   *
   * @param files
   * @returns {boolean}
   * @private
   */
  static _hasSensitiveFilesAltered(files) {
    let sensitivePaths = GitHubValidator._areInSensitivePath(files);
    let sensitiveFiles = GitHubValidator._areSensitiveFiles(files);
    return !(!sensitiveFiles && !sensitivePaths);
  }

  /**
   *
   * @param files
   * @private
   */
  static _areSensitiveFiles(files) {
    return Utils.isSomeInOtherArray(files, SENSITIVE_FILES);
  }

  /**
   *
   * @param files
   * @returns {*|boolean}
   * @private
   */
  static _areInSensitivePath(files) {
    return files.some(fl => GitHubValidator._isFileInSensitivePath(fl));
  }

  /**
   *
   * @param file
   * @returns {boolean}
   * @private
   */
  static _isFileInSensitivePath(file) {
    return SENSITIVE_PATHS.some((fl) => file.indexOf(fl) !== -1);
  }

  /**
   *
   * @param labels
   * @private
   */
  static _hasSensitiveLabels(labels) {
    return Utils.isSomeInOtherArray(SENSITIVE_LABELS, labels);
  }
}

module.exports = GitHubValidator;
