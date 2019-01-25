"use strict";

const GitHubService = require("../../../../Services/Git/GitHub/GitHubService");
const Configuration = require("../../../../Configuration");
const GitHubGraphqlResponseBuilder = require("../../../_helpers/GitHubGraphqlResponseBuilder");
const axios = require("axios");
const GitHubChecksResponseBuilder = require("../../../_helpers/GitHubChecksResponseBuilder");

const expectedHeaders = {
  "Authorization": "bearer CUSTOM_TOKEN_FOR_GITHUB_API",
  "Accept": "",
  "Content-Type": "application/json"
};

const expectedRequestOptions = {
  method: "POST",
  headers: expectedHeaders,
  data: "data",
  url: "https://api.github.com/graphql"
};

function mockAxiosRejection() {
  axios.mockImplementationOnce(() => Promise.reject({error: true}));
}

const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
let githubService = new GitHubService(config);
let baseDate, commitDate, reviewDate, review2Date, checkDate;

jest.mock("axios");

beforeEach(() => {
  baseDate = new Date();
  commitDate = new Date(baseDate).toISOString();
  reviewDate = new Date(baseDate.setTime(baseDate.getTime() + 60000)).toISOString();
  review2Date = new Date(baseDate.setTime(baseDate.getTime() + 60000)).toISOString();
  checkDate = new Date(baseDate.setTime(baseDate.getTime() + 60000)).toISOString();
});

test("Should return the pull request cannot be found", async () => {
  let resp = {
    "data": null,
    "errors": []
  };
  axios.mockResolvedValueOnce(resp);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The requested pull cannot be found");
  expect(response.isFoundOnRemote).toBeFalsy();
});

test("Should get a PullRequest ready to be merged", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "REQUESTED_CHANGES", reviewDate)
    .withReview("Bob", "APPROVED", review2Date)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeTruthy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest and hasReviewByArchitectAfterPush should be true", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("HasReviewByArchitect", "manuerumx", "emoji-ply", 100)
    .withAuthor("emoji-ply")
    .withCommitDate("2019-01-08T17:00:00.067Z")
    .withLabels(["Good"])
    .withChangedFiles(["index.js", "package.json", "app/data/controller.js"])
    .withReview("manuerumx", "APPROVED", "2019-01-08T17:05:00.067Z")
    .withCommitDate("2019-01-08T17:10:00.067Z")
    .withReview("bob", "APPROVED", "2019-01-08T17:15:00.067Z")
    .withState("OPEN")
    .build();

  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", "2019-01-08T17:20:00.067Z").build();

  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request modifies sensitive files and is required the review of an architect after the last push");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("emoji-ply");
  expect(response.hasReviews).toBeTruthy();
});

test("Should get a PullRequest ready to be merged but too old", async () => {
  const commitOldDate = new Date(baseDate.setTime(baseDate.getDate() - 10)).toISOString();
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitOldDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "APPROVED", reviewDate)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is too old");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with sensitive changes", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "REQUESTED_CHANGES", reviewDate)
    .withReview("Bob", "APPROVED", review2Date)
    .withChangedFiles(["index.js", "package.json", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request modifies sensitive files and is required the review of an architect");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with base branch other than master", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "REQUESTED_CHANGES", reviewDate)
    .withReview("Bob", "APPROVED", review2Date)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  resp.data.repository.pullRequest.baseRefName = "random";
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is not targeting to master branch");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with CI failures", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "REQUESTED_CHANGES", reviewDate)
    .withReview("Bob", "APPROVED", review2Date)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "error", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("CI suite reported failures");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest closed", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "APPROVED", reviewDate)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withClosedStatus(true)
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is closed");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with conflicts", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "APPROVED", reviewDate)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withMergeableStatus("CONFLICTING")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request has conflicts that must be resolved");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with no reviews", async () => {
  const checkDate = new Date(baseDate.setTime(baseDate.getTime() + 60000)).toISOString();
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("manuerumx")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request need a review from another developer");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeFalsy();

});

test("Should get a PullRequest with requested changes", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "REQUESTED_CHANGES", reviewDate)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request has changes requested");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with push after review", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(commitDate)
    .withReview("Bob", "APPROVED", commitDate)
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withCommitDate(checkDate)
    .withReview("Bob", "APPROVED", reviewDate)
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withState("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("finished", "success", checkDate).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request includes a commit after the last review");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest entity already merged", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(new Date().toISOString())
    .withLabels(["Good"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "APPROVED", new Date().toISOString())
    .withChangedFiles(["index.js", "file.css", "app/data/controller.js"])
    .withAuthor("manuerumx")
    .withMergedStatus(true)
    .withState("CLOSED")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.Builder()
    .with_check("success", "ok", new Date().toISOString()).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await githubService.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is already merged");
  expect(response.canBeMerged).toBeFalsy();
  expect(response.isMerged).toBeTruthy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should getPullRequestInfo return mocked data", async () => {
  const resp = new GitHubGraphqlResponseBuilder.Builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .withCommitDate(new Date().toISOString())
    .withLabels(["needs_rebase", "bug"])
    .withAuthor("emoji-ply")
    .withReview("Bob", "APPROVED", new Date().toISOString())
    .build();
  axios.mockResolvedValueOnce(resp);
  let response = await githubService.getPullRequestInfo("manuerumx", "emoji-ply", 100);

  expect(response.data).toEqual(resp.data);
});

test("Should getPullRequestInfo return a mocked error", async () => {
  mockAxiosRejection();
  let response = await githubService.getPullRequestInfo();

  expect(response).toBeNull();
});

test("Should getChecksForCommit return mocked data", async () => {
  let resp = {"data": [{"name": "bob"}]};
  axios.mockResolvedValueOnce(resp);
  let response = await githubService.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response.data).toEqual(resp.data);
});

test("Should getChecksForCommit return a mocked error", async () => {
  mockAxiosRejection();
  let response = await githubService.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response).toBeNull();
});

test("Should mergePullRequest return mocked data", async () => {
  let resp = {"data": [{"name": "bob"}]};
  axios.mockResolvedValue(resp);
  let response = await githubService.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response.data).toEqual(resp.data);
});

test("Should mergePullRequest return a mocked error", async () => {
  mockAxiosRejection();
  let response = await githubService.mergePullRequest("manuerumx", "emoji-ply", 100, "Merged by test");

  expect(response).toBeNull();
});

test("Should getHeaders include token", () => {
  let headers = githubService.getHeaders();

  expect(headers).toEqual(expectedHeaders);
});

test("Should buildRequestOptions returns data", () => {
  let requestOptions = githubService.buildRequestOptions(
    githubService.getHeaders(),
    GitHubService.getGraphqlUri(),
    "POST", "data");

  expect(requestOptions).toEqual(expectedRequestOptions);
});
