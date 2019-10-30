"use strict";

class EnvLoader {
  /**
   *
   * @param name
   * @param val
   */
  addProperty(name, val) {
    const definition = {
      enumerable: true,
      configurable: false,
      writable: false,
      value: val
    };
    Object.defineProperty(this, name, definition);
  }

  /**
   *
   * @param name
   * @returns {*}
   */
  getVariable(name) {
    if (this.hasOwnProperty(name)) {
      return this[name];
    }
    throw "Unable to find the variable";
  }
}

module.exports = EnvLoader;
