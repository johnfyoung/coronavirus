import mongoose, { Schema } from "mongoose";
import { dbg, logError, isEmpty, isABefore } from "../util/tools";

const dataPullSchema = new Schema({
  name: String,
  pullTime: Date
});

// check to see if the suplied dt is newer then the most recent datapull
dataPullSchema.statics.isNew = async function(dt, name) {
  const dataPull = await this.findLatest(name);
  dbg(`comparing ${dataPull.pullTime} and ${dt}`);
  if (isEmpty(dataPull) || isABefore(dataPull.pullTime, dt)) {
    dbg("Got a new datapull!");
    return true;
  } else {
    dbg("Not a new datapull!");
    false;
  }
};

dataPullSchema.statics.findByDate = async function(name, date = null) {
  let result = null;
  const dateFilter = {
    $gte: new Date(`${date}T00:00:00.000Z`),
    $lte: new Date(`${date}T23:59:59.999Z`)
  };
  const filter = date
    ? {
        name: name,
        pullTime: dateFilter
      }
    : {};

  try {
    result = await this.aggregate([
      {
        $match: filter
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              date: "$pullTime",
              format: "%Y-%m-%d"
            }
          }
        }
      },
      {
        $sort: {
          pullTime: -1
        }
      },
      {
        $group: {
          _id: "$date",
          lastPullOfDay: { $first: "$_id" }
        }
      },
      {
        $group: {
          _id: null,
          dataPulls: { $push: "$lastPullOfDay" }
        }
      }
    ]);
  } catch (err) {
    logError(`Error getting DataPull by date: ${err}`);
  }

  return result;
};

dataPullSchema.statics.findLatest = async function(name) {
  try {
    const result = await this.find({ name })
      .sort({ pullTime: -1 })
      .limit(1);
    if (result.length > 0) {
      return result[0];
    }

    return null;
  } catch (err) {
    logError(`Error getting latest DataPull: ${err}`);
  }
};

export const DataPull = mongoose.model("dataPulls", dataPullSchema);
