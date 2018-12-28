'use strict';

const GitHubService = require('../../../Services/GitHub/GitHubService');
const Configuration = require('../../../Configuration');
const axios = require('axios');

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

jest.mock('axios');

test('Should getPullRequestInfo return mocked data', async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = {data: [{name: 'Mocked'}]};
  axios.mockResolvedValue(resp);
  let response = await github_service.getPullRequestInfo();

  expect(response.data).toEqual(resp.data);
});


test('Should getPullRequestInfo return a mocked error', async () => {
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getPullRequestInfo();

  expect(response).toBeNull();
});

test('Should returnHeaders include token', () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let headers = github_service.returnHeaders();

  expect(headers).toEqual(expected_headers);
});

test('Should buildRequestOptions returns data', () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let request_options = github_service.buildRequestOptions(
    github_service.returnHeaders(),
    github_service.getGraphqlUri(),
    'POST', 'data');

  expect(request_options).toEqual(expected_request_options);
});

function mockAxiosRejection() {
  axios.mockImplementationOnce(() => Promise.reject({error: true}));
}
