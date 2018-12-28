'use strict';

const axios = require('axios');
const Configuration = require('../../Configuration');

class GitHubService {
  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
  }

  getGraphqlUri() {
    return 'https://api.github.com/graphql';
  }

  returnHeaders() {
    return {
      'Authorization': 'bearer ' + this._configuration.getVariable('GITHUB_TOKEN'),
      'Accept': 'application/vnd.github.ocelot-preview+json',
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
