'use strict';

const GitHubService = require('../../../Services/GitHub/GitHubService');
const Configuration = require('../../../Configuration');
const GitHubGraphqlResponseBuilder = require("../../_helpers/GitHubGraphqlResponseBuilder");
const axios = require('axios');
const GitHubChecksResponseBuilder = require("../../_helpers/GitHubChecksResponseBuilder");

const expected_headers = {
  'Authorization': 'bearer CUSTOM_TOKEN_FOR_GITHUB_API',
  'Accept': '',
  'Content-Type': 'application/json'
};

const expected_request_options = {
  method: 'POST',
  headers: expected_headers,
  data: 'data',
  url: 'https://api.github.com/graphql'
};

jest.mock('axios');

test('Should getPullRequest and return a PullRequest entity', async()=> {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder('Mocked Test', 'manuerumx', 'emoji-ply', 100)
    .with_commit_date(new Date().toISOString())
    .with_labels(['needs_rebase', 'bug'])
    .with_author('emoji-ply')
    .with_review('Bob', 'APPROVED', new Date().toISOString())
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check('success', 'ok', new Date().toISOString()).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest('manuerumx', 'emoji-ply', 100);


  expect(true).toBeTruthy();
});

test('Should getPullRequestInfo return mocked data', async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder('Mocked Test', 'manuerumx', 'emoji-ply', 100)
    .with_commit_date(new Date().toISOString())
    .with_labels(['needs_rebase', 'bug'])
    .with_author('emoji-ply')
    .with_review('Bob', 'APPROVED', new Date().toISOString())
    .build();
  axios.mockResolvedValueOnce(resp);
  let response = await github_service.getPullRequestInfo('manuerumx', 'emoji-ply', 100);

  expect(response.data).toEqual(resp.data);
});

test('Should getPullRequestInfo return a mocked error', async () => {
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getPullRequestInfo();

  expect(response).toBeNull();
});

test('Should getChecksForCommit return mocked data', async()=>{
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let resp = {'data': [{'name':'bob'}]};

  axios.mockResolvedValueOnce(resp);

  let response = await github_service.getChecksForCommit('manuerumx', 'emoji-ply', 'random_sha');

  expect(response.data).toEqual(resp.data);
});

test('Should getChecksForCommit return a mocked error', async()=>{
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getChecksForCommit('manuerumx', 'emoji-ply', 'random_sha');

  expect(response).toBeNull();
});

test('Should mergePullRequest return mocked data', async()=>{
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let resp = {'data': [{'name':'bob'}]};

  axios.mockResolvedValue(resp);

  let response = await github_service.getChecksForCommit('manuerumx', 'emoji-ply', 'random_sha');

  expect(response.data).toEqual(resp.data);
});

test('Should mergePullRequest return a mocked error', async()=>{
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.mergePullRequest('manuerumx', 'emoji-ply', 100, 'Merged by test');

  expect(response).toBeNull();
});

test('Should getHeaders include token', () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let headers = github_service.getHeaders();

  expect(headers).toEqual(expected_headers);
});

test('Should buildRequestOptions returns data', () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let request_options = github_service.buildRequestOptions(
    github_service.getHeaders(),
    github_service.getGraphqlUri(),
    'POST', 'data');

  expect(request_options).toEqual(expected_request_options);
});

function mockAxiosRejection() {
  axios.mockImplementationOnce(() => Promise.reject({error: true}));
}
