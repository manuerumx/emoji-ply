"use strict";

const EnvLoader = require("./EnvLoader");

class Configuration extends EnvLoader {
  /**
   * @param {array} services
   */
  constructor(...services) {
    super();
    this.services = services;
    this.addProperty("environment", process.env.ENV || "test");
    this.processServicesVariables();
  }

  getEnvironment() {
    return this.getVariable("environment");
  }

  processServicesVariables() {
    this.services.forEach(service => this.loadAndProcessService(service));
  }

  loadAndProcessService(service) {
    service.forEach(element => this.loadEnvFromService(element));
  }

  loadEnvFromService(service) {
    let variable_data = service.split('=');
    if (variable_data.length === 2) {
      this.addProperty(variable_data[0], process.env[variable_data[0]] || variable_data[1]);
    }
  }
}


module.exports = Configuration;
