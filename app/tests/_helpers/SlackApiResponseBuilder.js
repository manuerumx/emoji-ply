'use strict';

class SlackApiResponseBuilder {

  constructor(response) {
    return response;
  }

  static get builder() {
    class Builder {
      constructor() {
        this._response = {
          "ok": true,
          "channel": "XXXXXXXXX",
          "ts": "1503435956.000247",
          "message": {
            "text": "Here's a message for you",
            "username": "ecto1",
            "bot_id": "B19LU7CSY",
            "attachments": [],
            "type": "message",
            "subtype": "bot_message",
            "ts": "1503435956.000247"
          }
        };
      }

      _buildPad(ts) {
        let rand = Math.floor(Math.random() * 100000);
        ts = ts + "." + rand.toString().padStart(6, '0');
        return ts;
      }

      with_message(channel, message) {
        this._response.channel = channel;
        this._response.message.text = message;
        return this;
      }

      with_custom_timestamp(ts, pad = true, custom_pad = "") {
        if (pad && custom_pad === "") {
          ts = this._buildPad(ts);
        } else if (pad && custom_pad !== "") {
          ts = ts + "." + custom_pad;
        }

        this._response.ts = ts;
        this._response.message.ts = ts;
        return this;
      }

      buildWithError(message_error) {
        this._response = {
          "ok": false,
          "error": message_error
        };
        return new SlackApiResponseBuilder(this._response);
      }

      buildMessage() {
        return new SlackApiResponseBuilder(this._response)
      }
    }

    return Builder;
  }
}


module.exports = SlackApiResponseBuilder;
