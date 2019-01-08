'use strict';

const SlackService = require('../../../Services/Slack/SlackService');
const Configuration = require('../../../Configuration');
const axios = require('axios');

jest.mock('axios');

test('Should return headers for the request', ()=>{
  const config = new Configuration(["SLACK_TOKEN=CUSTOM_TOKEN_FOR_SLACK_BOT"]);
  let slack_service = new SlackService(config);
  let headers = slack_service.getRequestHeaders(false);
  expect(headers.Authorization).toBe('bearer CUSTOM_TOKEN_FOR_SLACK_BOT');
  expect(headers["Content-Type"]).toBe('application/x-www-form-urlencoded');

  let headers_json = slack_service.getRequestHeaders(true);
  expect(headers_json.Authorization).toBe('bearer CUSTOM_TOKEN_FOR_SLACK_BOT');
  expect(headers_json["Content-Type"]).toBe('application/json;charset=UTF-8');
});
