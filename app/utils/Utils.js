"use strict";

class Utils {

  static extractValueOrDefault(el, ky, defaultValue = "undefined") {
    if (el.hasOwnProperty(ky)) {
      return el[ky];
    }
    return defaultValue;
  }

  static cleanArrayDuplicates(arrayDuplicated) {
    return arrayDuplicated.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
  }

  static isSomeInOtherArray(arrayOne, arrayTwo) {
    return arrayOne.some((element) => arrayTwo.indexOf(element) >= 0);
  }

  static extractInfoFromGitHubUrl(url) {
    const regex = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/|$)/iu;
    let m;
    if ((m = regex.exec(url)) !== null) {
      return {
        "owner": m[1],
        "repo": m[2],
        "number": m[3],
      };
    }
    return {
      "owner": null,
      "repo": null,
      "number": null,
    };
  }
}

module.exports = Utils;
