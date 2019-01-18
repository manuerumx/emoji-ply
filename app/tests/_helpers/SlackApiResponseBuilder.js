'use strict';
const SlackMessageResponseBuilder = require('./SlackBuilders/SlackMessageResponseBuilder');
const SlackMessageBuilder = require('./SlackBuilders/SlackMessageBuilder');
const SlackHistoryBuilder = require('./SlackBuilders/SlackHistoryBuilder');

class SlackApiResponseBuilder {

  constructor(response) {
    return response;
  }

  static get messageResponseBuilder() {
    return SlackMessageResponseBuilder;
  }

  static get historyBuilder() {
    return SlackHistoryBuilder;
  }

  static get messageBuilder(){
    return SlackMessageBuilder;
  }
}


module.exports = SlackApiResponseBuilder;
