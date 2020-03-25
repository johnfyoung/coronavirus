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

router.get("/wa-state", async (req, res) => {
  const result = await statsController.scrapeWAState();

  if (result) {
    res.json(result);
  } else {
    res.status(500).send("Unexpected failure gathering data");
  }
});

export default router;
