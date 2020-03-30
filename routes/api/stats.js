import express from "express";
//import { dataPullNames } from "../../config";
import { dbg, logError } from "../../util/tools";

import { statsController } from "../../controllers";

const router = express.Router();

router.get("/cases-by-country", async (req, res) => {
  const result = statsController.casesByCountry();
  if (result) {
    res.json(result);
    return;
  }

  res.status(500).send("Unexpected failure gathering data");
});

router.get("/wa-state/cases-by-date/:date?", async (req, res) => {
  const result = await statsController.getWAStateByDate(req.params.date);

  if (result) {
    res.json(result);
  } else {
    res.status(404).send("No datapulls on that date");
  }
});

router.get("/wa-state/cases-by-county/:countyName?", async (req, res) => {
  const result = await statsController.getWAStateByCounty(
    req.params.countyName
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/intl/cases-by-region/:regionName?", async (req, res) => {
  const result = await statsController.getCasesByRegion(
    req.params.regionName
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/wa-state/scrape", async (req, res) => {
  const result = await statsController.scrapeWAState();

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/johnshopkins/retrieve", async (req, res) => {
  try {
    const result = await statsController.retrieveJohnsHopkins();

    if (result) {
      res.json(result);
    } else {
      res.status(500).send("Unexpected failure gathering data");
    }
  } catch (err) {
    logError(`routes::api::stats::johnshopkins::retrieve: Error - ${err}`);
    res.status(500).send("Unexpected failure gathering data");
  }
});

export default router;
