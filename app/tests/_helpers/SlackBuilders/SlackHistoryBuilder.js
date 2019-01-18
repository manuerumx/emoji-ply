'use strict';

const SlackApiResponseBuilder = require('../SlackApiResponseBuilder');

class SlackHistoryBuilder {

  constructor() {
    this._messages = [];
    this._response = {
      "ok": true,
      "messages": [],
      "has_more": false
    };
  }

  with_message(message) {
    this._messages.unshift(message);
    return this;
  }


  buildHistory() {
    this._response.messages = this._messages;
    return SlackApiResponseBuilder.constructor(this._response);
  }

  buildWithError(message_error) {
    this._response = {
      "ok": false,
      "error": message_error
    };

    return SlackApiResponseBuilder.constructor(this._response);
  }
}

module.exports = SlackHistoryBuilder;
