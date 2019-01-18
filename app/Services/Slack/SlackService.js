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
    let options = {
      channel: channel,
      text: message
    };
    let request_options = this.buildRequestOptions(this.getRequestHeaders(true), "POST", options);
    return await this.processRequest(request_options);
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

  async processRequest(request_options) {
    let response = null;
    try {
      response = await axios(request_options);
    } catch (error) {
      response = error;
    }
    return response;
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

