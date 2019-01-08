'use strict';

const axios = require('axios');
const Configuration = require('../../Configuration');

class SlackService {

  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
  }

  sendMessage() {
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

  processRequest() {
  }

  getRequestHeaders(is_json = false) {
    return {
      'Authorization': 'bearer ' + this._configuration.getVariable('SLACK_TOKEN'),
      'Content-Type': (is_json ? 'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded')
    };
  }

}

module.exports = SlackService;

