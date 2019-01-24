"use strict";

const GitHubParser = require("../../../../Services/Git/GitHub/GitHubParser");
const GitHubGraphqlResponseBuilder = require("../../../_helpers/GitHubGraphqlResponseBuilder");
const GitHubChecksResponseBuilder = require("../../../_helpers/GitHubChecksResponseBuilder");

const commitDate = new Date().toISOString();
const reviewDate = new Date().toISOString();

const githubData = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
  .withCommitDate(commitDate)
  .withLabels(["needs_rebase", "bug"])
  .withAuthor("emoji-ply")
  .withReview("Bob", "APPROVED", reviewDate)
  .build();

test("Should return null because no checks reported", () => {
  const checksEmptyResponse = new GitHubChecksResponseBuilder.builder()
    .build();
  const expected = {"conclusion": "Undefined", "status": "Undefined"};
  let result = GitHubParser.parseChecks(checksEmptyResponse);

  expect(result).toEqual(expected);
});

test("Should extract the checks status", () => {
  const checksResponse = new GitHubChecksResponseBuilder.builder()
    .with_check("completed", "neutral", commitDate)
    .build();

  const expected = {"conclusion": "neutral", "status": "completed"};
  let result = GitHubParser.parseChecks(checksResponse);

  expect(result).toEqual(expected);
});

test("Should extract the files altered by the pull request", () => {
  const expected = ["Readme.md", ".gitignore"];
  let result = GitHubParser.parseFiles(githubData.data.repository.pullRequest.files.nodes);

  expect(result).toEqual(expected);
});

test("Should extract the reviews", () => {
  const expected = [{"author": "Bob", "createdAt": reviewDate, "state": "APPROVED"}];
  let result = GitHubParser.parseReviews(githubData.data.repository.pullRequest.reviews.nodes);

  expect(result).toEqual(expected);
});

test("Should extract the labels from the pull request", () => {
  const expected = ["needs_rebase", "bug"];
  let result = GitHubParser.parseLabels(githubData.data.repository.pullRequest.labels.nodes);

  expect(result).toEqual(expected);
});

test("Should extract SHA information from commit data", () => {
  const expected = "156e1c5caf671165f26440e32e0dcc207be0137c";
  let result = GitHubParser.extractInfoFromLastCommit(githubData.data.repository.pullRequest);

  expect(result).toEqual(expected);
});

test("Should extract date from last commit", () => {
  let result = GitHubParser.extractLastCommitDate(githubData.data.repository.pullRequest);

  expect(result).toEqual(commitDate);
});
