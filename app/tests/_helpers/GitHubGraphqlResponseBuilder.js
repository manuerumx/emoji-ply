'use strict';

class GitHubGraphqlResponseBuilder {

  constructor(response) {
    return response;
  }

  static get builder() {
    class Builder {
      constructor(title, organization, repository, number) {
        this.title = title;
        this.organization = organization;
        this.repository = repository;
        this.number = number;
        this.state = 'OPEN';
        this.mergeable = 'MERGEABLE';
        this.merged_status = false;
        this.locked = false;
        this.additions = parseInt(Math.random() * 10);
        this.deletions = parseInt(Math.random() * 10);
        this.closed_status = false;
        this.author = 'manuerumx';
        this.files = ['Readme.md', '.gitignore'];
        this.labels = [];
        this.reviews = [];
        this.commits = [];
      }

      with_author(author) {
        this.author = author;
        return this;
      }

      with_changed_files(files) {
        this.files = this.files.concat(files);
        return this;
      }

      with_state(state = 'OPEN') {
        this.state = state;
        return this;
      }

      with_merged_status(merged = false) {
        this.merged_status = merged;
        return this;
      }

      with_mergeable_status(mergeable_status = 'MERGEABLE') {
        this.mergeable = mergeable_status;
        return this;
      }

      with_locked_status(locked_status = false) {
        this.locked = locked_status;
        return this;
      }

      with_additions(additions = 10) {
        this.additions = additions;
        return this;
      }

      with_deletions(deletions = 10) {
        this.deletions = deletions;
        return this;
      }

      with_closed_status(closed_status = false) {
        this.closed_status = closed_status;
        return this;
      }

      with_review(author, state, date) {
        let review = {
          "state": state,
          "createdAt": date,
          "author": {
            "login": author
          }
        };
        this.reviews.push(review);
        return this;
      }

      with_labels(labels) {
        this.labels = labels;
        return this;
      }

      with_commit_date(commit_date) {
        let commit = {
          "id": "MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MjQxMDE0MzI1OjE1NmUxYzVjYWY2NzExNjVmMjY0NDBlMzJlMGRjYzIwN2JlMDEzN2M=",
          "commit": {
            "pushedDate": commit_date
          }
        };
        this.commits.push(commit);
        return this;
      }

      build() {
        if (this.commits.length === 0) {
          this.commits.push({
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
                "merged": this.merged_status,
                "mergeable": this.mergeable,
                "locked": this.locked,
                "closed": this.closed_status,
                "additions": this.additions,
                "deletions": this.deletions,
                "files": {
                  "nodes": this.files.map(fl => {
                    return {"path": fl}
                  })
                },
                "reviews": {
                  "nodes": this.reviews
                },
                "labels": {
                  "nodes": this.labels.map(fl => {
                    return {"name": fl}
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
