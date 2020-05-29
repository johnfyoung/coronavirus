import { statsController } from "../controllers";
import mongoose from "mongoose";
import { dbg, logJob, logError } from "../util/tools";

require("dotenv").config();
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(async () => {
    dbg("MongoDB connected");
    const result = await statsController.retrieveJohnsHopkins();
    logJob(
      `Job completed: ${result.meta.message}`,
      "retrieveJohnsHopkins"
    ).then(() => {
      mongoose.disconnect();
      process.exit();
    });
  })
  .catch((err) => logError(`retrieveJohnsHopkins:: error - ${err}`));
