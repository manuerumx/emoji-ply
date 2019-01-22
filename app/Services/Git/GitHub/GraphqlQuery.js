module.exports = (organization, repository, number) => {
  let query = `{ \
  repository(owner: "${organization}", name: "${repository}") { \
    pullRequest(number: ${number}) {\
      headRefName \
      baseRefName \
      changedFiles \
      author { \
        login\
      }\
      url\
      revertUrl\
      state\
      title\
      merged\
      mergeable\
      locked\
      closed\
      additions\
      deletions\
      files(last: 30) {\
        nodes {\
          path\
        }\
      }\
      reviews(last: 30) {\
        nodes {\
          state\
          createdAt\
          author {\
            login\
          }\
        }\
      }\
      labels(first: 10) {\
        nodes {\
          name\
        }\
      }\
      commits(last: 1) {\
        nodes {\
          id\
          commit {\
            pushedDate\
          }\
        }\
      }\
    }\
  }\
}`;
  let _query = {
    query
  };
  return JSON.stringify(_query);
};
