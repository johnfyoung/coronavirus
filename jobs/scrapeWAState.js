import { statsController } from "../controllers";
import mongoose from "mongoose";
import { dbg, logJob } from "../util/tools";

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    dbg("MongoDB connected");
    await statsController.scrapeWAState();
    logJob("Job completed: scrapeWAState").then(() => {
      mongoose.disconnect();
      process.exit();
    });
  })
  .catch(err => console.log(err));
