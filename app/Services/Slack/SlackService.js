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
    this._last_request = null;
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
    let request_options = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(request_options);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param channel {string}
   * @param text {string}
   * @param thread_ts {string}
   * @param reply_to_channel {boolean}
   * @returns {Promise<*>}
   */
  async sendMessageAsReplyTo(channel, text, thread_ts, reply_to_channel = false) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text,
      thread_ts,
      reply_to_channel
    };
    let request_options = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(request_options);
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
    let request_options = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(request_options);
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
    let request_options = this.buildRequestOptions(uri_params, headers, "GET", null);

    return await this.processRequest(request_options);
  }

  /**
   * @see https://api.slack.com/methods/chat.update
   * @param channel {string}
   * @param text {string}
   * @param thread_ts {string}
   * @returns {Promise<void>}
   */
  async updateMessage(channel, text, thread_ts) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      text,
      thread_ts
    };
    let request_options = this.buildRequestOptions("chat.update", headers, "POST", options);

    return await this.processRequest(request_options);
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
    let request_options = this.buildRequestOptions("chat.postEphemeral", headers, "POST", options);

    return await this.processRequest(request_options);
  }

  /**
   * @see https://api.slack.com/methods/chat.postMessage
   * @param thread_ts {string}
   * @param channel {string}
   * @param text {string}
   * @param attachments {Object}
   * @returns {Promise<*>}
   */
  async sendAttachmentToMessage(thread_ts, channel, text, attachments) {
    let headers = this.getRequestHeaders(true);
    let reply_broadcast = false;
    let options = {
      thread_ts,
      channel,
      text,
      attachments,
      reply_broadcast
    };
    let request_options = this.buildRequestOptions("chat.postMessage", headers, "POST", options);

    return await this.processRequest(request_options);
  }

  /**
   * @see https://api.slack.com/methods/reactions.add
   * @param channel {string}
   * @param thread_ts {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async reactToMessage(channel, thread_ts, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      thread_ts,
      name: reaction
    };
    let request_options = this.buildRequestOptions("reactions.add", headers, "POST", options);
    return await this.processRequest(request_options);
  }

  /**
   * @see https://api.slack.com/methods/reactions.remove
   * @param channel {string}
   * @param thread_ts {string}
   * @param reaction {string}
   * @returns {Promise<*>}
   */
  async removeReactionToMessage(channel, thread_ts, reaction) {
    let headers = this.getRequestHeaders(true);
    let options = {
      channel,
      thread_ts,
      name: reaction
    };
    let request_options = this.buildRequestOptions("reactions.remove", headers, "POST", options);
    return await this.processRequest(request_options);
  }

  async _throttleRequests() {
    let time_since_last_request = (new Date().getTime() / 1000) - this._last_request;
    let minimum_time_in_micros = SLACK_CONSTANTS.REQUEST_RATE_LIMIT / 1000;
    if (time_since_last_request < minimum_time_in_micros) {
      await (this._sleep(100));
    }
  }

  _storeLastRequest() {
    this._last_request = (new Date().getTime() / 1000);
  }

  async processRequest(request_options) {
    let response = null;
    this._throttleRequests();

    try {
      response = await axios(request_options);
    } catch (error) {
      response = error;
    }
    this._storeLastRequest();
    return response;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  buildRequestOptions(uri, headers, method, raw_data) {
    return {
      method: method,
      headers: headers,
      data: raw_data,
      url: SLACK_CONSTANTS.SLACK_DEFAULT_URL + uri,
    };
  }

  getRequestHeaders(is_json = false) {
    return {
      "Authorization": "bearer " + this._configuration.getVariable("SLACK_TOKEN"),
      "Content-Type": (is_json ? "application/json;charset=UTF-8" : "application/x-www-form-urlencoded")
    };
  }

}

module.exports = SlackService;

