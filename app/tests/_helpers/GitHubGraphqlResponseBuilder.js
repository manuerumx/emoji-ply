'use strict';

class GitHubGraphqlResponseBuilder {

  constructor(build) {
    this._repository = build.repository;
    this._number = build.number;
    this._organization = build.organization;

  }

  static get builder() {
    class Builder {

      with_organization(organization) {
        this.organization = organization;
        return this;
      }

      with_repository(repository) {
        this.repository = repository;
        return this;
      }

      with_number(number) {
        this.number = number;
        return this;
      }

      build() {
        return new GitHubGraphqlResponseBuilder(this);
      }
    }

    return Builder;
  }

}

let n = new GitHubGraphqlResponseBuilder.builder()
  .with_organization('manuerumx')
  .with_number(100)
  .with_repository('emoji-ply')
  .build();
