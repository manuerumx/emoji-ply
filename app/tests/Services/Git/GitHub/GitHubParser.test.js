'use strict';

const GitHubParser = require('../../../../Services/Git/GitHub/GitHubParser');
const GitHubGraphqlResponseBuilder = require("../../../_helpers/GitHubGraphqlResponseBuilder");
const GitHubChecksResponseBuilder = require('../../../_helpers/GitHubChecksResponseBuilder');

const commit_date = new Date().toISOString();
const review_date = new Date().toISOString();

const github_data = new GitHubGraphqlResponseBuilder.builder('Mocked Test', 'manuerumx', 'emoji-ply', 100)
  .with_commit_date(commit_date)
  .with_labels(['needs_rebase', 'bug'])
  .with_author('emoji-ply')
  .with_review('Bob', 'APPROVED', review_date)
  .build();

test('Should return null because no checks reported', () => {
  const checks_empty_response = new GitHubChecksResponseBuilder.builder()
    .build();
  const expected = {"conclusion": "Undefined", "status": "Undefined"};
  let result = GitHubParser.parseChecks(checks_empty_response);

  expect(result).toEqual(expected);
});

test('Should extract the checks status', () => {
  const checks_response = new GitHubChecksResponseBuilder.builder()
    .with_check('completed', 'neutral', commit_date)
    .build();

  const expected = {"conclusion": "neutral", "status": "completed"};
  let result = GitHubParser.parseChecks(checks_response);

  expect(result).toEqual(expected);
});

test('Should extract the files altered by the pull request', () => {
  const expected = ["Readme.md", ".gitignore"];
  let result = GitHubParser.parseFiles(github_data.data.repository.pullRequest.files.nodes);

  expect(result).toEqual(expected);
});

test('Should extract the reviews', () => {
  const expected = [{"author": "Bob", "createdAt": review_date, "state": "APPROVED"}];
  let result = GitHubParser.parseReviews(github_data.data.repository.pullRequest.reviews.nodes);

  expect(result).toEqual(expected);
});

test('Should extract the labels from the pull request', () => {
  const expected = ["needs_rebase", "bug"];
  let result = GitHubParser.parseLabels(github_data.data.repository.pullRequest.labels.nodes);

  expect(result).toEqual(expected);
});

test('Should extract SHA information from commit data', () => {
  const expected = '156e1c5caf671165f26440e32e0dcc207be0137c';
  let result = GitHubParser.extractInfoFromLastCommit(github_data.data.repository.pullRequest);

  expect(result).toEqual(expected);
});

test('Should extract date from last commit', () => {
  let result = GitHubParser.extractLastCommitDate(github_data.data.repository.pullRequest);

  expect(result).toEqual(commit_date);
});
