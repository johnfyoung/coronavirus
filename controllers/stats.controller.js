import { dataPullNames } from "../config";
import { logError, dbg } from "../util/tools";
import moment from "moment";

import {
  johnsHopkinsRetrieveData,
  johnsHopkinsGetLatestUpdateTime,
} from "../util/apis/file-johnsHopkins";
import { CasesByCounty, DataPull, CasesByRegion } from "../models";

export const statsController = {
  // DEPRECATED: the RapidApi one didn't ave the
  // getCasesByCountry: async () => {
  //   let result = null;
  //   try {
  //     result = await apiCoronaVirus.casesByCountry();
  //   } catch (err) {
  //     logError(`Error getting cases by country: ${err}`);
  //   }
  getCasesByRegion: async (regionName = null) => {
    const countryFilter = regionName ? { country: regionName } : {};
    try {
      return await CasesByRegion.aggregate([
        { $match: countryFilter },
        { $sort: { country: 1 } },
      ]);
    } catch (err) {
      logError(
        `statsController::getCasesByRegion::Error aggregating data ${err}`
      );
    }

    return null;
  },
  getCasesByCounty: async (stateName = null, countyName = null) => {
    let filter = stateName
      ? { state: { $regex: stateName, $options: "i" } }
      : {};
    filter = countyName
      ? { ...filter, county: { $regex: countyName, $options: "i" } }
      : filter;
    try {
      return await CasesByCounty.aggregate([
        { $match: filter },
        { $sort: { state: 1, county: 1 } },
      ]);
    } catch (err) {
      logError(
        `statsController::getCasesByCounty::Error aggregating data ${err}`
      );
    }

    return null;
  },
  getCountyList: async (stateName = null) => {
    const filter = stateName
      ? { state: { $regex: stateName, $options: "i" } }
      : {};
    try {
      return await CasesByCounty.aggregate([
        { $match: filter },
        { $sort: { state: 1, county: 1 } },
        { $project: { county: true } },
      ]);
    } catch (err) {
      logError(`statsController::getCountyList::Error aggregating data ${err}`);
    }

    return null;
  },
  getCountiesSorted: async (stateName, sort, dir, date) => {
    try {
      return await CasesByCounty.getCasesSorted(stateName, sort, dir, date);
    } catch (err) {
      logError(
        `statsController::getCountiesSorted::Error aggregating data ${err}`
      );
    }
  },
  getStatesSorted: async (sort, direction, date) => {
    try {
      return await CasesByCounty.getStateCasesSorted(sort, direction, date);
    } catch (err) {
      logError(
        `statsController::getStatesSorted::Error aggregating data ${err}`
      );
    }
  },
  getStateList: async () => {
    try {
      return await CasesByCounty.distinct("state");
    } catch (err) {
      logError(`statsController::getCountyList::Error aggregating data ${err}`);
    }

    return null;
  },
  getCasesByState: async (stateName = null) => {
    const filter = stateName ? { state: stateName } : {};
    try {
      return await CasesByCounty.aggregate([
        { $match: filter },
        { $sort: { state: 1, county: 1 } },
      ]);
    } catch (err) {
      logError(
        `statsController::getCasesByState::Error aggregating data ${err}`
      );
    }

    return null;
  },
  getTotals: async (stateName, countyName, startDate, endDate) => {
    try {
      return CasesByCounty.getTotals(stateName, countyName, startDate, endDate);
    } catch (err) {
      `statsController::getTotals::Error aggregating data ${err}`;
    }
  },
  getSnapshot: async (sort, dir, date) => {
    try {
      return CasesByCounty.getSnapshot(sort, dir, date);
    } catch (err) {
      `statsController::getByDate::Error aggregating data ${err}`;
    }
  },
  getLatestDataDump: async (dumpName) => {
    return await DataPull.findLatest(dumpName);
  },
  retrieveJohnsHopkins: async (force = false) => {
    const lastUpdated = await johnsHopkinsGetLatestUpdateTime();
    //dbg("Last Updated:", lastUpdated);
    let result = {
      meta: {
        status: 0,
        message: "No new data",
      },
    };

    let newDataPull = null;
    try {
      if (
        (lastUpdated &&
          (await DataPull.isNew(lastUpdated, dataPullNames.JOHNSHOPKINS))) ||
        force
      ) {
        result.meta = {
          status: 1,
          message: force ? "Forcing data pull" : "New data",
        };

        result.data = await johnsHopkinsRetrieveData();

        newDataPull = new DataPull({
          name: dataPullNames.JOHNSHOPKINS,
          pullTime: lastUpdated,
        });

        await newDataPull.save(function(err) {
          if (err) {
            logError(`Error saving DataPull: ${err}`);
          }
        });

        // 2020-05-29 NOTE: since this data is not being displayed, this is disabled
        // await CasesByRegion.updateFromDataPull(result.data.intl);
        await CasesByCounty.updateFromDataPull(result.data.us, newDataPull);
      }
    } catch (err) {
      DataPull.deleteOne(newDataPull);
      logError(
        `statsController::retrieveJohnsHopkins: Could not retrieve the files from Johns Hopkins - ${err}`
      );
    }

    return result;
  },
};
