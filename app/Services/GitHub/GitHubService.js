'use strict';

const axios = require('axios');
const Configuration = require('../../Configuration');
const GraphqlQuery = require('./GraphqlQuery');

class GitHubService {
  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
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
