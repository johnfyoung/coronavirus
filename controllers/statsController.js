import { dataPullNames } from "../config";
import { logError, dbg } from "../util/tools";
import scraperWAState from "../util/apis/scrape-state";
import apiCoronaVirus from "../util/apis/api-corona";
import {
  CasesByCounty,
  CasesByAge,
  CasesByPosNeg,
  CasesBySex,
  DataPull
} from "../models";

export const statsController = {
  casesByCountry: async () => {
    let result = null;
    try {
      result = await apiCoronaVirus.casesByCountry();
    } catch (err) {
      logError(`Error getting cases by country: ${err}`);
    }

    return result;
  },
  scrapeWAState: async () => {
    let result = null;
    try {
      result = await scraperWAState();

      if (await DataPull.isNew(result.lastUpdated, dataPullNames.WASTATE)) {
        const newDataPull = new DataPull({
          name: dataPullNames.WASTATE,
          pullTime: result.lastUpdated
        });

        await newDataPull.save(function(err) {
          if (err) {
            logError(`Error saving DataPull: ${err}`);
          }
        });

        await CasesByCounty.saveDataPull(
          result.tables[0].rows,
          result.lastUpdated,
          newDataPull
        );

        await CasesByPosNeg.saveCases(
          result.tables[1],
          result.lastUpdated,
          newDataPull
        );

        await CasesByAge.saveCases(
          result.tables[2],
          result.lastUpdated,
          newDataPull
        );

        await CasesBySex.saveCases(
          result.tables[3],
          result.lastUpdated,
          newDataPull
        );
      }
    } catch (err) {
      logError(
        `statsController::scrapeWAState::Error scraping WA State COVID Data: ${err}`
      );
    }

    return result;
  },
  getWAStateByCounty: async (countyName = null) => {
    const countyFilter = countyName ? { county: countyName } : {};
    try {
      return await CasesByCounty.aggregate([
        { $match: countyFilter },
        { $sort: { updateTime: 1 } },
        {
          $group: {
            _id: "$county",
            data: {
              $push: {
                cases: "$cases",
                deaths: "$deaths",
                updateTime: "$updateTime"
              }
            }
          }
        }
      ]);
    } catch (err) {
      logError(
        `statsController::getWAStateByCounty::Error aggregating data ${err}`
      );
    }

    return null;
  },
  getWAStateByDate: async (date = null) => {
    let result = null;
    try {
      const dataPullSet = await DataPull.findByDate("wastate", date);
      dbg("Find DataPull by date", dataPullSet[0]);

      if (Array.isArray(dataPullSet) && dataPullSet.length === 1) {
        result = CasesByCounty.getByDataPulls(dataPullSet[0].dataPulls);
      }
    } catch (err) {
      logError(
        `statsController::getWAStateByDate::Error aggregating data ${err}`
      );
    }

    return result;
  }
};
