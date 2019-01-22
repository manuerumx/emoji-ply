"use strict";
const SlackApiResponseBuilder = require("../SlackApiResponseBuilder");

class SlackMessageBuilder {
  constructor() {
    this._message = {
      type: "",
      ts: "",
      user: "",
      text: ""
    };
  }

  with_text(text) {
    this._message.text = text;
    return this;
  }

  with_timestamp(ts) {
    this._message.ts = ts;
    return this;
  }

  from_user(user) {
    this._message.user = user;
    return this;
  }

  with_subtype(subtype) {
    this._message.subtype = subtype;
    return this;
  }

  with_botId(bot_id) {
    this._message.bot_id = bot_id;
    return this;
  }

  with_attachments(attachments) {
    this._message.attachments = attachments;
    return this;
  }

  with_reactions(reactions) {
    this._message.reactions = reactions;
    return this;
  }

  is_starred() {
    this._message.is_starred = true;
    return this;
  }

  buildBasicMessage(ts, user, text) {
    this._message = {
      type: "message",
      ts: ts,
      user: user,
      text: text
    };

    return this._build();
  }

  buildCustomMessage() {
    return this._build();
  }

  _build() {
    return SlackApiResponseBuilder.constructor(this._message);
  }
}

module.exports = SlackMessageBuilder;
