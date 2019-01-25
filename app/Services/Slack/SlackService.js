"use strict";

const axios = require("axios");
const Configuration = require("../../Configuration");
const SLACK_CONSTANTS = require("./SlackConstants");

class SlackService {

  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    this._configuration = configuration;
    this._lastRequest = null;
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param defaultChannel {string}
   * @param message {string}
   * @returns {Promise<*>}
   */
  async sendMessage(defaultChannel, message) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "text": message
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param defaultChannel {string}
   * @param message {string}
   * @param threadTs {string}
   * @param replyToChannel {boolean}
   * @returns {Promise<*>}
   */
  async sendMessageAsReplyTo(defaultChannel, message, threadTs, replyToChannel = false) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "text": message,
      "thread_ts": threadTs,
      "reply_to_channel": replyToChannel
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param message {string}
   * @returns {Promise<*>}
   */
  async sendMessageToLogChannel(message) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": SLACK_CONSTANTS.CHANNEL_LOGS,
      "text": message
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/channels.history
   * @param channel {string}
   * @param qty {number}
   * @param publicChannel {boolean}
   * @returns {Promise<*>}
   */
  async getChannelHistory(channel = SLACK_CONSTANTS.CHANNEL_DEPLOY, qty = 50, publicChannel = true) {
    const api_namespace = publicChannel ? "channels" : "groups";
    const uriParams = `${api_namespace}history?channel=${channel}&count=${qty}`;
    let headers = this.getRequestHeaders(false);
    let requestOptions = this.buildRequestOptions(uriParams, headers, "GET", null);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.update
   * @param defaultChannel {string}
   * @param message {string}
   * @param threadTs {string}
   * @returns {Promise<void>}
   */
  async updateMessage(defaultChannel, message, threadTs) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "text": message,
      "thread_ts": threadTs
    };
    let requestOptions = this.buildRequestOptions("chat.update", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postEphemeral
   * @param defaultChannel {string}
   * @param message {string}
   * @param to_user {string}
   * @returns {Promise<void>}
   */
  async sendEphemeralMessage(defaultChannel, message, to_user) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "text": message,
      "user": to_user
    };
    let requestOptions = this.buildRequestOptions("chat.postEphemeral", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param threadTs {string}
   * @param defaultChannel {string}
   * @param message {string}
   * @param attachment {Object}
   * @returns {Promise<*>}
   */
  async sendAttachmentToMessage(threadTs, defaultChannel, message, attachment) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "thread_ts": threadTs,
      "channel": defaultChannel,
      "text": message,
      "attachments": attachment,
      "reply_broadcast": false
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/reactions.add
   * @param defaultChannel {string}
   * @param threadTs {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async reactToMessage(defaultChannel, threadTs, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "thread_ts": threadTs,
      "name": reaction
    };
    let requestOptions = this.buildRequestOptions("reactions.add", headers, "POST", options);
    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/reactions.remove
   * @param defaultChannel {string}
   * @param threadTs {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async removeReactionToMessage(defaultChannel, threadTs, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      "channel": defaultChannel,
      "thread_ts": threadTs,
      "name": reaction
    };
    let requestOptions = this.buildRequestOptions("reactions.remove", headers, "POST", options);
    return await this.processRequest(requestOptions);
  }

  async _throttleRequests() {
    let timeSinceLastRequest = (new Date().getTime() / 1000) - this._lastRequest;
    let minimumTimeInMicros = SLACK_CONSTANTS.REQUEST_RATE_LIMIT / 1000;
    if (timeSinceLastRequest < minimumTimeInMicros) {
      await (this._sleep(100));
    }
  }

  _storeLastRequest() {
    this._lastRequest = (new Date().getTime() / 1000);
  }

  async processRequest(requestOptions) {
    let response = null;
    this._throttleRequests();

    try {
      response = await axios(requestOptions);
    } catch (error) {
      response = error;
    }
    this._storeLastRequest();
    return response;
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  buildRequestOptions(uri, headers, method, rawData) {
    return {
      "method": method,
      "headers": headers,
      "data": rawData,
      "url": SLACK_CONSTANTS.SLACK_DEFAULT_URL + uri,
    };
  }

  getRequestHeaders(isJson = false) {
    return {
      "Authorization": "bearer " + this._configuration.getVariable("SLACK_TOKEN"),
      "Content-Type": (isJson ? "application/json;charset=UTF-8" : "application/x-www-form-urlencoded")
    };
  }

}

module.exports = SlackService;

