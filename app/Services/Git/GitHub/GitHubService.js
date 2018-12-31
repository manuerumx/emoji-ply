'use strict';

const axios = require('axios');
const Configuration = require('../../../Configuration');
const GraphqlQuery = require('./GraphqlQuery');
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
    let github_data = await this.getPullRequestInfo(organization, repository, number);
    if (github_data.hasOwnProperty('errors')) {
      return GitHubPullRequestFactory.buildPullRequestFromGithub({}, undefined, undefined, undefined, undefined, undefined);
    }
    let info = github_data.data.repository.pullRequest;

    let sha_commit = GitHubParser.extractInfoFromLastCommit(info);
    let github_info_checks = await this.getChecksForCommit(organization, repository, sha_commit);

    let files = GitHubParser.parseFiles(info.files.nodes);
    let reviews = GitHubParser.parseReviews(info.reviews.nodes);
    let checks = GitHubParser.parseChecks(github_info_checks);
    let labels = GitHubParser.parseLabels(info.labels.nodes);
    let commit_pushed_at = GitHubParser.extractLastCommitDate(info);

    return GitHubPullRequestFactory.buildPullRequestFromGithub(info, files, reviews, checks, labels, commit_pushed_at);
  }

  async getPullRequestInfo(organization, repository, number) {
    let response = null;
    try {
      const url = this.getGraphqlUri();
      let headers = this.getHeaders();
      const query_data = GraphqlQuery(organization, repository, number);
      headers.Accept = 'application/vnd.github.ocelot-preview+json';
      const request_options = this.buildRequestOptions(headers, url, 'POST', query_data);

      response = await axios(request_options);
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async getChecksForCommit(organization, repository, sha_commit) {
    let response = null;
    try {
      const uri = `https://api.github.com/repos/${organization}/${repository}/commits/${sha_commit}/check-runs`;
      let headers = this.getHeaders();
      headers.Accept = 'application/vnd.github.antiope-preview+json';
      const request_options = this.buildRequestOptions(headers, uri, 'GET', null);

      response = await axios(request_options);
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
      const request_options = this.buildRequestOptions(headers, uri, 'PUT', JSON.stringify(body));

      response = await axios(request_options);
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  getGraphqlUri() {
    return 'https://api.github.com/graphql';
  }

  getHeaders() {
    return {
      'Authorization': 'bearer ' + this._configuration.getVariable('GITHUB_TOKEN'),
      'Accept': '',
      'Content-Type': 'application/json'
    };
  }

  buildRequestOptions(headers, uri, method, raw_data) {
    return {
      method: method,
      headers: headers,
      data: raw_data,
      url: uri
    };
  }

}

module.exports = GitHubService;
