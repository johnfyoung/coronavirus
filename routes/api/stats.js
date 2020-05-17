import express from "express";
import { dataPullNames } from "../../config";
import { dbg, logError } from "../../util/tools";
import { sortMethods } from "../../config/constants";

import { statsController } from "../../controllers";

const router = express.Router();

router.get("/us/last-updated", async (req, res) => {
  try {
    const result = await statsController.getLatestDataDump(dataPullNames.JOHNSHOPKINS);
    if (result) {
      res.json(result);
    } else {
      res.status(204).send("No updates in the system");
    }
  } catch (err) {
    res.status(500).send("Unexpected failure getting last update time");
  }
});

router.get("/us/cases-by-state/:stateName?", async (req, res) => {
  const result = await statsController.getCasesByState(
    req.params.stateName
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/us/cases-by-county/:stateName/:countyName?", async (req, res) => {
  const result = await statsController.getCasesByCounty(
    req.params.stateName,
    req.params.countyName
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/us/cases-by-county-sorted/:stateName", async (req, res) => {
  const result = await statsController.getCountiesSorted(
    req.params.stateName,
    req.query.sort ? req.query.sort : sortMethods.CASES,
    req.query.direction ? req.query.direction : "desc",
    req.query.date ? req.query.date : ""
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/us/cases-by-county-date", async (req, res) => {
  dbg("cases-by-county-date req", req.query);
  const result = await statsController.getByDate(
    req.query.sort ? req.query.sort : sortMethods.CASES,
    req.query.dir ? req.query.dir : "desc",
    req.query.date ? req.query.date : ""
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/us/cases-by-state-sorted", async (req, res) => {
  const result = await statsController.getStatesSorted(
    req.query.sort,
    req.query.direction,
    req.query.date
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});
router.get("/us/cases-totals", async (req, res) => {
  const result = await statsController.getTotals(
    req.query.state,
    req.query.county,
    req.query.start,
    req.query.end
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});
router.get("/us/county-list/:stateName?", async (req, res) => {
  const result = await statsController.getCountyList(
    req.params.stateName
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

router.get("/us/state-list", async (req, res) => {
  const result = await statsController.getStateList();

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

router.get("/johnshopkins/retrieve", async (req, res) => {
  try {
    const result = await statsController.retrieveJohnsHopkins();

    if (result && result.meta.status) {
      res.json(result);
    } else {
      if (result && result.meta.status === 0) {
        res.status(204).send(result.meta.message);
      }
    }
  } catch (err) {
    logError(`routes::api::stats::johnshopkins::retrieve: Error - ${err}`);
    res.status(500).send("Unexpected failure gathering data");
  }
});

export default router;
