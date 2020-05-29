import axios from "axios";
import csvParse from "async-csv";
import { logError, isEmpty, dbg } from "../tools";
require("dotenv").config();

const csvRootPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/csse_covid_19_time_series/";

const dataRootPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/git/blobs/";

const githubAPIPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/commits";

// Filenames as they are in the github repo
const remoteFiles = {
  // 2020-05-29 NOTE: this data is currently not represented on the site
  // to speed data collection it has been paused
  // intl: {
  //   "time_series_covid19_confirmed_global.csv": {
  //     type: "cases",
  //     path: "csse_covid_19_time_series",
  //     file: "time_series_covid19_confirmed_global.csv",
  //   },
  //   "time_series_covid19_deaths_global.csv": {
  //     type: "deaths",
  //     path: "csse_covid_19_time_series",
  //     file: "time_series_covid19_deaths_global.csv",
  //   },
  //   "time_series_covid19_recovered_global.csv": {
  //     type: "recovered",
  //     path: "csse_covid_19_time_series",
  //     file: "time_series_covid19_recovered_global.csv",
  //   },
  // },
  us: {
    "time_series_covid19_confirmed_US.csv": {
      type: "cases",
      path: "csse_covid_19_time_series",
      file: "time_series_covid19_confirmed_US.csv",
    },
    "time_series_covid19_deaths_US.csv": {
      type: "deaths",
      path: "csse_covid_19_time_series",
      file: "time_series_covid19_deaths_US.csv",
    },
  },
};

/**
 * Uses the GitHub API to get the latest commit time
 */
export const johnsHopkinsGetLatestUpdateTime = async () => {
  let commitDate = null;

  try {
    const response = await axios.get(githubAPIPath, {
      headers: { Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN },
    });

    if (!isEmpty(response.data) && response.data.length) {
      commitDate = response.data[0].commit.committer.date;
    } else {
      throw new Error("Found no commits");
    }
  } catch (err) {
    logError(
      `file-johnsHopkins::getLatestUpdateTime:Error getting Johns Hopkins Update time:${err}`
    );
  }

  return commitDate;
};

/**
 * Uses the Github api to retrive each csv file - requires Github API access token
 */
export const johnsHopkinsRetrieveData = async () => {
  let result = {};

  try {
    // get sha for each file
    await getCurrentFileSHA(remoteFiles);

    //dbg("Remote files", remoteFiles);

    for (const key of Object.keys(remoteFiles)) {
      result[key] = {};
      for (const filename of Object.keys(remoteFiles[key])) {
        const url = `${dataRootPath}${remoteFiles[key][filename].sha}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN,
          },
        });

        const buffer = Buffer.from(
          response.data.content,
          response.data.encoding
        );
        result[key][filename] = {
          type: remoteFiles[key][filename].type,
        };
        result[key][filename].data = await csvParse.parse(buffer.toString());
      }
    }
  } catch (err) {
    logError(
      `file-johnHopkins::johnsHopkinsRetrieveData::Error retrieving data from Johns Hopkins: ${err}`
    );
  }

  return result;
};

export const getCurrentFileSHA = async (fileList) => {
  try {
    const fileMeta = await axios.get(`${csvRootPath}`);
    //dbg('fileMeta', fileMeta);

    fileMeta.data.map((file) => {
      for (const key of Object.keys(fileList)) {
        if (fileList[key][file.name]) {
          fileList[key][file.name].sha = file.sha;
        }
      }
    });

    dbg("Filelist with SHA", fileList);
  } catch (err) {
    logError(
      `file-johnHopkins::johnsHopkinsRetrieveData::Error retrieving sha for files: ${err}`
    );
  }
};
