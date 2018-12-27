'use strict';

class EnvLoader {

  addProperty(name, val) {
    const definition = {
      enumerable: true,
      configurable: false,
      writable: false,
      value: val
    };
    Object.defineProperty(this, name, definition);
  }

  getVariable(name) {
    if (this.hasOwnProperty(name)) {
      return this[name]
    }
    throw 'Unable to find the variable';
  }
}

module.exports = EnvLoader;
