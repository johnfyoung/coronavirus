const util = require("util");
const exec = util.promisify(require("child_process").exec);

exports.handler = async (event) => {
  let response = {};
  try {
    const { stdout, stderr } = await exec(
      "npx babel-node jobs/retrieveJohnsHopkins.js"
    );

    response = {
      statusCode: 200,
      body: JSON.stringify({ stdout: `${stdout}`, stderr: `${stderr}` }),
    };
  } catch (err) {
    response = {
      statusCode: 503,
      body: JSON.stringify({ err: `${err}` }),
    };
  }

  return response;
};