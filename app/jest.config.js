module.exports = {
  "browser": true,
  "collectCoverageFrom": [
    "<rootDir>/**/*.{js,jsx}",
    "!<rootDir>/jest.config.js",
    "!<rootDir>/index.js",
  ],
  "coveragePathIgnorePatterns": ["<rootDir>/node_modules/", "<rootDir>/tests/_helpers/", "<rootDir>/coverage/"],
  "verbose": false
};
