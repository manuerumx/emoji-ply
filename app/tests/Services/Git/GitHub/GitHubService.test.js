"use strict";

const GitHubService = require("../../../../Services/Git/GitHub/GitHubService");
const Configuration = require("../../../../Configuration");
const GitHubGraphqlResponseBuilder = require("../../../_helpers/GitHubGraphqlResponseBuilder");
const axios = require("axios");
const GitHubChecksResponseBuilder = require("../../../_helpers/GitHubChecksResponseBuilder");

const expected_headers = {
  "Authorization": "bearer CUSTOM_TOKEN_FOR_GITHUB_API",
  "Accept": "",
  "Content-Type": "application/json"
};

const expected_request_options = {
  method: "POST",
  headers: expected_headers,
  data: "data",
  url: "https://api.github.com/graphql"
};

jest.mock("axios");

test("Should return the pull request cannot be found", async () => {
  let resp = {
    "data": null,
    "errors": []
  };
  axios.mockResolvedValueOnce(resp);
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The requested pull cannot be found");
  expect(response.isFoundOnRemote).toBeFalsy();
});

test("Should get a PullRequest ready to be merged", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "REQUESTED_CHANGES", review_date)
    .with_review("Bob", "APPROVED", review2_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeTruthy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest and hasReviewByArchitectAfterPush should be true", async()=> {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("HasReviewByArchitect", "manuerumx", "emoji-ply", 100)
    .with_author("emoji-ply")
    .with_commit_date("2019-01-08T17:00:00.067Z")
    .with_labels(["Good"])
    .with_changed_files(["index.js", "package.json", "app/data/controller.js"])
    .with_review("manuerumx", "APPROVED", "2019-01-08T17:05:00.067Z")
    .with_commit_date("2019-01-08T17:10:00.067Z")
    .with_review("bob", "APPROVED", "2019-01-08T17:15:00.067Z")
    .with_state("OPEN")
    .build();

  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", "2019-01-08T17:20:00.067Z").build();

  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request modifies sensitive files and is required the review of an architect after the last push");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("emoji-ply");
  expect(response.hasReviews).toBeTruthy();
});

test("Should get a PullRequest ready to be merged but too old", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date.setTime(base_date.getTime() - 600000000)).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "APPROVED", review_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is too old");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with sensitive changes", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "REQUESTED_CHANGES", review_date)
    .with_review("Bob", "APPROVED", review2_date)
    .with_changed_files(["index.js", "package.json", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request modifies sensitive files and is required the review of an architect");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with base branch other than master", async () => {

  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "REQUESTED_CHANGES", review_date)
    .with_review("Bob", "APPROVED", review2_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  resp.data.repository.pullRequest.baseRefName = "random";
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is not targeting to master branch");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with CI failures", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "REQUESTED_CHANGES", review_date)
    .with_review("Bob", "APPROVED", review2_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "error", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("CI suite reported failures");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest closed", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "APPROVED", review_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_closed_status(true)
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is closed");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with conflicts", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "APPROVED", review_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_mergeable_status("CONFLICTING")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request has conflicts that must be resolved");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with no reviews", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const review2_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("manuerumx")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request need a review from another developer");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeFalsy();

});

test("Should get a PullRequest with requested changes", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "REQUESTED_CHANGES", review_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request has changes requested");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest with push after review", async () => {
  const base_date = new Date();
  const commit_date = new Date(base_date).toISOString();
  const review_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();
  const check_date = new Date(base_date.setTime(base_date.getTime() + 60000)).toISOString();

  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(commit_date)
    .with_review("Bob", "APPROVED", commit_date)
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_commit_date(check_date)
    .with_review("Bob", "APPROVED", review_date)
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_state("OPEN")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("finished", "success", check_date).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request includes a commit after the last review");
  expect(response.isMerged).toBeFalsy();
  expect(response.canBeMerged).toBeFalsy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should get a PullRequest entity already merged", async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(new Date().toISOString())
    .with_labels(["Good"])
    .with_author("emoji-ply")
    .with_review("Bob", "APPROVED", new Date().toISOString())
    .with_changed_files(["index.js", "file.css", "app/data/controller.js"])
    .with_author("manuerumx")
    .with_merged_status(true)
    .with_state("CLOSED")
    .build();
  const resp2 = new GitHubChecksResponseBuilder.builder()
    .with_check("success", "ok", new Date().toISOString()).build();
  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp2);

  let response = await github_service.getPullRequest("manuerumx", "emoji-ply", 100);
  expect(response.reason).toBe("The pull request is already merged");
  expect(response.canBeMerged).toBeFalsy();
  expect(response.isMerged).toBeTruthy();
  expect(response.author).toBe("manuerumx");
  expect(response.hasReviews).toBeTruthy();

});

test("Should getPullRequestInfo return mocked data", async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  const resp = new GitHubGraphqlResponseBuilder.builder("Mocked Test", "manuerumx", "emoji-ply", 100)
    .with_commit_date(new Date().toISOString())
    .with_labels(["needs_rebase", "bug"])
    .with_author("emoji-ply")
    .with_review("Bob", "APPROVED", new Date().toISOString())
    .build();
  axios.mockResolvedValueOnce(resp);
  let response = await github_service.getPullRequestInfo("manuerumx", "emoji-ply", 100);

  expect(response.data).toEqual(resp.data);
});

test("Should getPullRequestInfo return a mocked error", async () => {
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getPullRequestInfo();

  expect(response).toBeNull();
});

test("Should getChecksForCommit return mocked data", async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let resp = {"data": [{"name": "bob"}]};

  axios.mockResolvedValueOnce(resp);

  let response = await github_service.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response.data).toEqual(resp.data);
});

test("Should getChecksForCommit return a mocked error", async () => {
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response).toBeNull();
});

test("Should mergePullRequest return mocked data", async () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let resp = {"data": [{"name": "bob"}]};

  axios.mockResolvedValue(resp);

  let response = await github_service.getChecksForCommit("manuerumx", "emoji-ply", "random_sha");

  expect(response.data).toEqual(resp.data);
});

test("Should mergePullRequest return a mocked error", async () => {
  mockAxiosRejection();
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let response = await github_service.mergePullRequest("manuerumx", "emoji-ply", 100, "Merged by test");

  expect(response).toBeNull();
});

test("Should getHeaders include token", () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let headers = github_service.getHeaders();

  expect(headers).toEqual(expected_headers);
});

test("Should buildRequestOptions returns data", () => {
  const config = new Configuration(["GITHUB_TOKEN=CUSTOM_TOKEN_FOR_GITHUB_API"]);
  let github_service = new GitHubService(config);
  let request_options = github_service.buildRequestOptions(
    github_service.getHeaders(),
    github_service.getGraphqlUri(),
    "POST", "data");

  expect(request_options).toEqual(expected_request_options);
});

function mockAxiosRejection() {
  axios.mockImplementationOnce(() => Promise.reject({error: true}));
}
