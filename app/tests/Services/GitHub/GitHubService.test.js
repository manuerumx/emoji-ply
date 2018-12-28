'use strict';

const GitHubService = require('../../../Services/GitHub/GitHubService');
const Configuration = require('../../../Configuration');

describe('Test suit GitHubService', () => {

  const expected_headers = {
    'Authorization': 'bearer CUSTOM_TOKEN_FOR_GITHUB_API',
    'Accept': 'application/vnd.github.ocelot-preview+json',
    'Content-Type': 'application/json'
  };

  const expected_request_options = {
    method: 'POST',
    headers: expected_headers,
    data: 'data',
    url: 'https://api.github.com/graphql'
  };

  test('Test returnHeaders include token', () => {
    const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
    let github_service = new GitHubService(config);
    let headers = github_service.returnHeaders();

    expect(headers).toEqual(expected_headers);
  });

  test('Test buildRequestOptions returns data', () => {
    const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
    let github_service = new GitHubService(config);
    let request_options = github_service.buildRequestOptions(
      github_service.returnHeaders(),
      github_service.getGraphqlUri(),
      'POST', 'data');

    expect(request_options).toEqual(expected_request_options);
  });

});
