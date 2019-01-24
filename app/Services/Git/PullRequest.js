"use strict";

class PullRequest {
  constructor(){
    this.isFoundOnRemote = "undefined";
    this.isMerged = "undefined";
    this.author = "undefined";
    this.url = "undefined";
    this.branch ="undefined";
    this.targetBranch ="undefined";
    this.isClosed = "undefined";
    this.hasCiApproval = "undefined";
    this.isSensitive = "undefined";
    this.hasReviewByArchitect = "undefined";
    this.hasReviewByArchitectAfterPush = "undefined";
    this.hasRequestedChanges = "undefined";
    this.hasReviews = "undefined";
    this.hasConflicts = "undefined";
    this.hasPushAfterReview = "undefined";
    this.commitPushedAt = "undefined";
    this.hasLabels = "undefined";
    this.canBeMerged = "undefined";
    this.reason = "undefined";
  }
}

module.exports = PullRequest;
