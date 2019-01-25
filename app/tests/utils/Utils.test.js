"use strict";
const Utils = require("../../utils/Utils");

describe("Test Utils class", () => {
  test("Test duplicated array is cleaned", () => {
    const expectedArray = [1, 2, 3, 4, "a", "b", "c"];
    const duplicatedArray = [1, 2, 2, 3, 4, 2, "a", "a", "b", "c"];
    let processedArray = Utils.cleanArrayDuplicates(duplicatedArray);
    expect(processedArray).toEqual(expectedArray);
  });
  test("Test the extraction of elements from an object", () => {
    const myObject = {
      url: "https://github.com/random/repository/pull/10142",
      repo: "repository",
      number: 10142,
      owner: "random"
    };

    expect(Utils.extractValueOrDefault(myObject, "number", 0)).toBe(10142);
    expect(Utils.extractValueOrDefault(myObject, "repo", "error")).toBe("repository");
    expect(Utils.extractValueOrDefault(myObject, "owner", "Ups")).toBe("random");
    expect(Utils.extractValueOrDefault(myObject, "Number", 0)).toBe(0);
    expect(Utils.extractValueOrDefault(myObject, "repository", "error")).toBe("error");
    expect(Utils.extractValueOrDefault(myObject, "ownerx")).toBe("undefined");
  });

  test("Test the detection of existance of one element into another array", () => {
    const arrayOne = [1, 2, 3, 4, 5];
    const arrayTwo = [6, 7, 8, 9, 2];
    const arrayThree = [6, 7, 8, 9, 0];
    expect(Utils.isSomeInOtherArray(arrayOne, arrayTwo)).toBeTruthy();
    expect(Utils.isSomeInOtherArray(arrayTwo, arrayOne)).toBeTruthy();
    expect(Utils.isSomeInOtherArray(arrayOne, arrayThree)).toBeFalsy();
  });

  test("Test the regular expression to extract/parse info from Github URL", () => {
    const invalidResponse = {"owner": null, "repo": null, "number": null};
    const urls = [
      ["https://github.com/octokit/rest.js/pull/998", {"owner": "octokit", "repo": "rest.js", "number": "998"}],
      ["https://github.com/octokit/rest.js/pull/998/files", {"owner": "octokit", "repo": "rest.js", "number": "998"}],
      ["https://github.com/octokit/rest.js/998", invalidResponse],
      ["https://www.google.com", invalidResponse],
    ];
    urls.forEach((current) => {
      let response = Utils.extractInfoFromGitHubUrl(current[0]);
      expect(response).toEqual(current[1]);
    });
  });
});
