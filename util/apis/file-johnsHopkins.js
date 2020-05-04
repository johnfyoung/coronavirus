import axios from "axios";
import csvParse from "async-csv";
import { logError, isEmpty, dbg } from "../tools";
require("dotenv").config();

const csvRootPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/";

const dataRootPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/git/blobs/";

const githubAPIPath =
  "https://api.github.com/repos/CSSEGISandData/COVID-19/commits";

// Filenames as they are in the github repo
const remoteFiles = {
  intl: {
    timeSeriesConfirmedCases: {
      type: "cases",
      path: "csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
      sha: "d4befad4009f63c91f938f7f57c6ae91d05d0d6c"
    },
    timeSeriesDeaths: {
      type: "deaths",
      path: "csse_covid_19_time_series/time_series_covid19_deaths_global.csv",
      sha: "3119b06d4cc6e861df476d451343a6cce0a1243f"
    },
    timeSeriesRecovered: {
      type: "recovered",
      path: "csse_covid_19_time_series/time_series_covid19_recovered_global.csv",
      sha: "3776b4ffa217e678c7b9567c63529a268422a77a"
    }
  },
  us: {
    timeSeriesConfirmedCases: {
      type: "cases",
      path: "csse_covid_19_time_series/time_series_covid19_confirmed_US.csv",
      sha: "5eeb3dcae5439d1496d7ea4271a00c1e5d04cd9a"
    },
    timeSeriesDeaths: {
      type: "deaths",
      path: "csse_covid_19_time_series/time_series_covid19_deaths_US.csv",
      sha: "5c45cfdbf529dbb0a24b5406e40c91b1f31820b3"
    }
  }
};

/**
 * Uses the GitHub API to get the latest commit time
 */
export const johnsHopkinsGetLatestUpdateTime = async () => {
  let commitDate = null;

  try {
    const response = await axios.get(githubAPIPath, {
      headers: { Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN }
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
    for (const key of Object.keys(remoteFiles)) {
      result[key] = {};
      for (const filename of Object.keys(remoteFiles[key])) {
        const response = await axios.get(
          `${dataRootPath}${remoteFiles[key][filename].sha}`,
          {
            headers: { Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN }
          }
        );

        const buffer = new Buffer(response.data.content, response.data.encoding);
        result[key][filename] = {
          type: remoteFiles[key][filename].type
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