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
    this.services.forEach((service) => this.loadAndProcessService(service));
  }

  loadAndProcessService(service) {
    service.forEach((element) => this.loadEnvFromService(element));
  }

  loadEnvFromService(service) {
    let variableData = service.split("=");
    if (variableData.length === 2) {
      this.addProperty(variableData[0], process.env[variableData[0]] || variableData[1]);
    }
  }
}


module.exports = Configuration;
