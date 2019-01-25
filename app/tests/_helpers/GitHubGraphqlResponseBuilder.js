"use strict";

class GitHubGraphqlResponseBuilder {

  constructor(response) {
    return response;
  }

  static get Builder() {
    class Builder {
      constructor(title, organization, repository, number) {
        this.title = title;
        this.organization = organization;
        this.repository = repository;
        this.number = number;
        this.state = "OPEN";
        this.mergeable = "MERGEABLE";
        this.mergedStatus = false;
        this.locked = false;
        this.additions = parseInt(Math.random() * 10, 10);
        this.deletions = parseInt(Math.random() * 10, 10);
        this.closedStatus = false;
        this.author = "manuerumx";
        this.files = ["Readme.md", ".gitignore"];
        this.labels = [];
        this.reviews = [];
        this.commits = [];
      }

      withAuthor(author) {
        this.author = author;
        return this;
      }

      withChangedFiles(files) {
        this.files = this.files.concat(files);
        return this;
      }

      withState(state = "OPEN") {
        this.state = state;
        return this;
      }

      withMergedStatus(merged = false) {
        this.mergedStatus = merged;
        return this;
      }

      withMergeableStatus(mergeableStatus = "MERGEABLE") {
        this.mergeable = mergeableStatus;
        return this;
      }

      withLockedStatus(lockedStatus = false) {
        this.locked = lockedStatus;
        return this;
      }

      withAdditions(additions = 10) {
        this.additions = additions;
        return this;
      }

      withDeletions(deletions = 10) {
        this.deletions = deletions;
        return this;
      }

      withClosedStatus(closedStatus = false) {
        this.closedStatus = closedStatus;
        return this;
      }

      withReview(reviewAuthor, reviewState, reviewDate) {
        let review = {
          "state": reviewState,
          "createdAt": reviewDate,
          "author": {
            "login": reviewAuthor
          }
        };
        this.reviews.push(review);
        return this;
      }

      withLabels(labels) {
        this.labels = labels;
        return this;
      }

      withCommitDate(commitDate) {
        let commit = {
          "id": "MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MjQxMDE0MzI1OjE1NmUxYzVjYWY2NzExNjVmMjY0NDBlMzJlMGRjYzIwN2JlMDEzN2M=",
          "commit": {
            "pushedDate": commitDate
          }
        };
        this.commits.unshift(commit);
        return this;
      }

      build() {
        if (this.commits.length === 0) {
          this.commits.unshift({
            "id": "MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MjQxMDE0MzI1OjE1NmUxYzVjYWY2NzExNjVmMjY0NDBlMzJlMGRjYzIwN2JlMDEzN2M=",
            "commit": {
              "pushedDate": new Date().toISOString()
            }
          });
        }
        let query = {
          "data": {
            "repository": {
              "pullRequest": {
                "headRefName": "feature/test-pr",
                "baseRefName": "master",
                "changedFiles": this.files.length,
                "author": {
                  "login": this.author,
                },
                "url": `https://github.com/${this.organization}/${this.repository}/pull/${this.number}`,
                "revertUrl": `https://github.com/${this.organization}/${this.repository}/pull/${this.number}/revert`,
                "state": this.state,
                "title": this.title,
                "merged": this.mergedStatus,
                "mergeable": this.mergeable,
                "locked": this.locked,
                "closed": this.closedStatus,
                "additions": this.additions,
                "deletions": this.deletions,
                "files": {
                  "nodes": this.files.map((fl) => {
                    return {"path": fl};
                  })
                },
                "reviews": {
                  "nodes": this.reviews
                },
                "labels": {
                  "nodes": this.labels.map((fl) => {
                    return {"name": fl};
                  })
                },
                "commits": {
                  "nodes": this.commits
                }
              }
            }
          }
        };
        return new GitHubGraphqlResponseBuilder(query);
      }
    }

    return Builder;
  }
}

module.exports = GitHubGraphqlResponseBuilder;
