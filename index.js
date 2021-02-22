const { exec } = require("child_process");

exports.handler = async (event) => {
  exec("npx babel-node jobs/retrieveJohnsHopkins.js", (err, stdout, stderr) => {
    let response = {};

    if (err) {
      //some err occurred
      response = {
        statusCode: 503,
        body: JSON.stringify({ err: `${err}` }),
      };
    } else {
      // the *entire* stdout and stderr (buffered)
      response = {
        statusCode: 200,
        body: JSON.stringify({ stdout: `${stdout}`, stderr: `${stderr}` }),
      };
    }

    return response;
  });
};
