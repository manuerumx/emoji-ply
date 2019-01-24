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
   * @param channel {string}
   * @param text {string}
   * @returns {Promise<*>}
   */
  async sendMessage(channel, text) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param channel {string}
   * @param text {string}
   * @param threadTs {string}
   * @param replyToChannel {boolean}
   * @returns {Promise<*>}
   */
  async sendMessageAsReplyTo(channel, text, threadTs, replyToChannel = false) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text,
      thread_ts: threadTs,
      reply_to_channel: replyToChannel
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param text {string}
   * @returns {Promise<*>}
   */
  async sendMessageToLogChannel(text) {
    let headers = this.getRequestHeaders(true);
    let channel = SLACK_CONSTANTS.CHANNEL_LOGS;
    let options = {
      channel,
      text
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/channels.history
   * @param channel {string}
   * @param qty {number}
   * @param public_channel {boolean}
   * @returns {Promise<*>}
   */
  async getChannelHistory(channel = SLACK_CONSTANTS.CHANNEL_DEPLOY, qty = 50, public_channel = true) {
    const api_namespace = public_channel ? "channels" : "groups";
    const uri_params = `${api_namespace}history?channel=${channel}&count=${qty}`;
    let headers = this.getRequestHeaders(false);
    let requestOptions = this.buildRequestOptions(uri_params, headers, "GET", null);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.update
   * @param channel {string}
   * @param text {string}
   * @param threadTs {string}
   * @returns {Promise<void>}
   */
  async updateMessage(channel, text, threadTs) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text,
      thread_ts: threadTs
    };
    let requestOptions = this.buildRequestOptions("chat.update", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postEphemeral
   * @param channel {string}
   * @param text {string}
   * @param user {string}
   * @returns {Promise<void>}
   */
  async sendEphemeralMessage(channel, text, user) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text,
      user
    };
    let requestOptions = this.buildRequestOptions("chat.postEphemeral", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param threadTs {string}
   * @param channel {string}
   * @param text {string}
   * @param attachments {Object}
   * @returns {Promise<*>}
   */
  async sendAttachmentToMessage(threadTs, channel, text, attachments) {
    let headers = this.getRequestHeaders(true);
    let replyBroadcast = false;
    let options = {
      thread_ts: threadTs,
      channel,
      text,
      attachments,
      reply_broadcast: replyBroadcast
    };
    let requestOptions = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/reactions.add
   * @param channel {string}
   * @param threadTs {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async reactToMessage(channel, threadTs, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      thread_ts: threadTs,
      name: reaction
    };
    let requestOptions = this.buildRequestOptions("reactions.add", headers, "POST", options);
    return await this.processRequest(requestOptions);
  }

  /**
   * @see https://api.slack.com/methods/reactions.remove
   * @param channel {string}
   * @param threadTs {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async removeReactionToMessage(channel, threadTs, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      thread_ts: threadTs,
      name: reaction
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
      method,
      headers,
      data: rawData,
      url: SLACK_CONSTANTS.SLACK_DEFAULT_URL + uri,
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

