"use strict";

const axios = require("axios");
const Configuration = require("../../../Configuration");
const GraphqlQuery = require("./GraphqlQuery");
const GitHubParser = require("./GitHubParser");
const GitHubPullRequestFactory = require("./GitHubPullRequestFactory");

class GitHubService {

  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
  }

  async getPullRequest(organization, repository, number) {
    let githubData = await this.getPullRequestInfo(organization, repository, number);
    if (githubData.hasOwnProperty("errors")) {
      return GitHubPullRequestFactory.buildPullRequestFromGithub({}, "undefined", "undefined", "undefined", "undefined", "undefined");
    }
    let info = githubData.data.repository.pullRequest;

    let shaCommit = GitHubParser.extractInfoFromLastCommit(info);
    let githubInfoChecks = await this.getChecksForCommit(organization, repository, shaCommit);

    let files = GitHubParser.parseFiles(info.files.nodes);
    let reviews = GitHubParser.parseReviews(info.reviews.nodes);
    let checks = GitHubParser.parseChecks(githubInfoChecks);
    let labels = GitHubParser.parseLabels(info.labels.nodes);
    let commitPushedAt = GitHubParser.extractLastCommitDate(info);

    return GitHubPullRequestFactory.buildPullRequestFromGithub(info, files, reviews, checks, labels, commitPushedAt);
  }

  async getPullRequestInfo(organization, repository, number) {
    let response = null;
    try {
      const url = GitHubService.getGraphqlUri();
      let headers = this.getHeaders();
      const queryData = GraphqlQuery(organization, repository, number);
      headers.Accept = "application/vnd.github.ocelot-preview+json";
      const requestOptions = this.buildRequestOptions(headers, url, "POST", queryData);

      response = await axios(requestOptions);
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async getChecksForCommit(organization, repository, shaCommit) {
    let response = null;
    try {
      const uri = `https://api.github.com/repos/${organization}/${repository}/commits/${shaCommit}/check-runs`;
      let headers = this.getHeaders();
      headers.Accept = "application/vnd.github.antiope-preview+json";
      const requestOptions = this.buildRequestOptions(headers, uri, "GET", null);

      response = await axios(requestOptions);
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async mergePullRequest(organization, repository, number, message) {
    let response = null;
    try {
      const uri = `https://api.github.com/repos/${organization}/${repository}/pulls/${number}/merge`;
      const headers = this.getHeaders();
      let body = {
        "commit_title": message
      };
      const requestOptions = this.buildRequestOptions(headers, uri, "PUT", JSON.stringify(body));

      response = await axios(requestOptions);
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  static getGraphqlUri() {
    return "https://api.github.com/graphql";
  }

  getHeaders() {
    return {
      "Authorization": "bearer " + this._configuration.getVariable("GITHUB_TOKEN"),
      "Accept": "",
      "Content-Type": "application/json"
    };
  }

  buildRequestOptions(headers, url, method, data) {
    return {
      method,
      headers,
      data,
      url
    };
  }

}

module.exports = GitHubService;
