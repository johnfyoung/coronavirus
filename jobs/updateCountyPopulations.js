import {
  getAllCountyPopulations
} from "../util/apis/api-census";
import {
  CasesByCounty
} from "../models";
import mongoose from "mongoose";
import {
  dbg,
  logJob,
  logError
} from "../util/tools";
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    dbg("MongoDB connected");
    try {
      const result = await getAllCountyPopulations();

      dbg(`updateCountyPopulations Job: Got result. Fields: ${result[0]}, Record Count: ${result.length}`);

      await Promise.all(result.map(async county => {
        await CasesByCounty.updatePopulation(...county);
      }));
    } catch (err) {
      logError(`updateCountyPopulations::error updating populations: ${err}`);
    }

    logJob(`Job completed`, "updateCountyPopulations").then(() => {
      mongoose.disconnect();
      process.exit();
    });
  })
  .catch(err => console.log(err));