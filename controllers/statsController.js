import { dataPullNames } from "../config";
import { logError } from "../util/tools";
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
        "statsController::scrapeWAState::Error scraping WA State COVID Data",
        err
      );
    }

    return result;
  }
};
