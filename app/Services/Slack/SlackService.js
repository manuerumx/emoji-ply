'use strict';

const axios = require('axios');
const Configuration = require('../../Configuration');
const SLACK_CONSTANTS = require('./SlackConstants');

class SlackService {

  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
    this._last_request = null;
  }

  async sendMessage(message, channel) {

  }

  sendMessageAsReplyTo() {
  }

  sendMessageToLogChannel() {
  }

  getChannelHistory() {
  }

  updateMessage() {
  }

  sendEphemeralMessage() {
  }

  sendConfirmationMessage() {
  }

  reactToMessage() {
  }

  removeReactionToMessage() {
  }

  throttleRequests() {
  }

  asyncprocessRequest() {

  }

  buildRequestOptions(headers, method, raw_data) {
    return {
      method: method,
      headers: headers,
      data: raw_data,
      url: SLACK_CONSTANTS.SLACK_DEFAULT_URL
    };
  }

  getRequestHeaders(is_json = false) {
    return {
      'Authorization': 'bearer ' + this._configuration.getVariable('SLACK_TOKEN'),
      'Content-Type': (is_json ? 'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded')
    };
  }

}

module.exports = SlackService;

