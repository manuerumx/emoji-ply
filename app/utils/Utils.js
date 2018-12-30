'use strict';

class Utils {

  static extractValueOrDefault(el, ky, default_value = undefined) {
    if (el.hasOwnProperty(ky)) {
      return el[ky];
    }
    return default_value;
  }

  static cleanArrayDuplicates(array_duplicated) {
    return array_duplicated.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
  }

  static isSomeInOtherArray(array_one, array_two) {
    return array_one.some(element => array_two.indexOf(element) >= 0);
  }

  static extractInfoFromGitHubUrl(url) {
    const regex = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/|$)/iu;
    let m;
    if ((m = regex.exec(url)) !== null) {
      return {
        'owner': m[1],
        'repo': m[2],
        'number': m[3],
      };
    }
    return {
      'owner': null,
      'repo': null,
      'number': null,
    };
  }
}

module.exports = Utils;
