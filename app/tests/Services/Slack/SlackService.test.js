"use strict";

const SlackApiResponseBuilder = require("../../_helpers/SlackApiResponseBuilder");
const SlackService = require("../../../Services/Slack/SlackService");
const Configuration = require("../../../Configuration");
const axios = require("axios");

jest.mock("axios");

test("Should return headers for the request", () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let headers = slack_service.getRequestHeaders();
  expect(headers.Authorization).toBe("bearer CUSTOM_TOKEN_FOR_SLACK_BOT");
  expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
});

test("Should return headers for the request JSON", () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let headers_json = slack_service.getRequestHeaders(true);
  expect(headers_json.Authorization).toBe("bearer CUSTOM_TOKEN_FOR_SLACK_BOT");
  expect(headers_json["Content-Type"]).toBe("application/json;charset=UTF-8");
});

test("Should return a valid response for sendMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .with_message("RANDOM", "Custom Message")
    .buildMessage();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendMessage("Custom Message", "RANDOM");
  expect(response).toBe(resp);
});

test("Should return a invalid response for sendMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .buildWithError("Something bad happen");
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendMessage("Custom Message", "RANDOM");
  expect(response).toBe(resp);
});

test("Should return an error in the request", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = {error: true};
  axios.mockImplementationOnce(() => Promise.reject(resp));
  let response = await slack_service.sendMessage("Custom Message", "RANDOM");
  expect(response).toBe(resp);
});

test("Should return a valid response for sendMessageToLogChannel", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .with_message("LOGS", "Custom Message")
    .buildMessage();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendMessageToLogChannel("Custom Message");
  expect(response).toBe(resp);
  expect(response.channel).toBe("LOGS");
});

test("Should return a valid response for sendMessageAsReplyTo", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .with_message("RANDOM", "Custom Message")
    .buildMessage();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendMessageAsReplyTo("RANDOM", "Custom Message", "1503435956.000247");
  expect(response).toBe(resp);
  expect(response.channel).toBe("RANDOM");
});

test("Should return a valid response for sendEphemeralMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .with_message("RANDOM", "Custom Message")
    .buildMessage();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendEphemeralMessage("RANDOM", "Custom Message", "1503435956.000247");
  expect(response).toBe(resp);
  expect(response.channel).toBe("RANDOM");
});


test("Should return a valid response for updateMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .buildUpdateMessageResponse("Custom Message", "RANDOM", "1503435956.000247");
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.updateMessage("RANDOM", "Custom Message", "1503435956.000247");
  expect(response).toBe(resp);
  expect(response.channel).toBe("RANDOM");
});


test("Should return a valid response for sendAttachmentToMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder()
    .with_message("RANDOM", "Custom Message")
    .buildMessage();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.sendAttachmentToMessage("RANDOM", "Custom Message", "1503435956.000247", {});
  expect(response).toBe(resp);
  expect(response.channel).toBe("RANDOM");
});


test("Should return a valid response for reactToMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder().buildReactionResponse();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.reactToMessage("RANDOM", "1503435956.000247", ":smile:");
  expect(response).toBe(resp);
  expect(response.ok).toBeTruthy();
});

test("Should return a valid response for reactToMessage", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let resp = new SlackApiResponseBuilder.messageResponseBuilder().buildReactionResponse();
  axios.mockResolvedValueOnce(resp);
  let response = await slack_service.removeReactionToMessage("RANDOM", "1503435956.000247", ":smile:");
  expect(response).toBe(resp);
  expect(response.ok).toBeTruthy();
});

test("Should return a valid response for getChannelHistory", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let message = new SlackApiResponseBuilder.messageBuilder().buildBasicMessage("1503435956.000247", "RANDOM", "Hello World");
  let resp = new SlackApiResponseBuilder.historyBuilder().with_message(message).buildHistory();

  axios
    .mockResolvedValueOnce(resp)
    .mockResolvedValueOnce(resp);

  let response = await slack_service.getChannelHistory();
  expect(response).toBe(resp);

  let response2 = await slack_service.getChannelHistory("RANDOM", 10, false);
  expect(response2).toBe(resp);

});

test("Should return await the sleep function", async () => {
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let time_start = (new Date().getTime() / 100).toFixed(0);
  await slack_service._sleep(100);
  let time_end = (new Date().getTime() / 100).toFixed(0);
  let diff = (time_end - time_start) * 100;
  expect(diff).toBe(100);
});
