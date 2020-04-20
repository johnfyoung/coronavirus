import express from "express";
import { dataPullNames } from "../../config";
import { dbg, logError } from "../../util/tools";

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

router.get("/us/cases-by-county-sorted/:stateName/:sort?", async (req, res) => {
  const result = await statsController.getCountiesSorted(
    req.params.stateName,
    req.params.sort
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});
router.get("/us/cases-by-state-sorted/:sort?/:direction?", async (req, res) => {
  const result = await statsController.getStatesSorted(
    req.params.sort,
    req.params.direction
  );

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});
router.get("/us/cases-totals", async (req, res) => {
  const result = await statsController.getTotals(
    req.query.start,
    req.query.end,
    req.query.state,
    req.query.county
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
