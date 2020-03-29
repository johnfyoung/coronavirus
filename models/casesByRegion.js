import mongoose, { Schema } from "mongoose";
import { logError } from "../util/tools";
import moment from "moment";

const casesByRegionSchema = new Schema({
  uniqueKey: String,
  country: String,
  province: String,
  lat: Number,
  long: Number,
  casesByDate: Array,
  deathsByDate: Array,
  recoveredByDate: Array
});

const makeUniqueKey = function(country, province) {
  return `${country
    .toLowerCase()
    .replace(/[\s'()]/g, "")}_${province
    .toLowerCase()
    .replace(/[\s'()]/g, "")}`;
};

casesByRegionSchema.statics.formatDataPull = dataObj => {
  const data = {};
  for (const key of Object.keys(dataObj)) {
    const dates = dataObj[key].data.shift().slice(4);
    // names[dataObj[key].type] = [];
    dataObj[key].data.forEach(row => {
      const regionID = makeUniqueKey(row[1], row[0]);
      const dataByDate = row.slice(4);
      if (!data[regionID]) {
        data[regionID] = {};
        data[regionID]["country"] = row[1];
        data[regionID]["province"] = row[0];
        data[regionID]["lat"] = row[2];
        data[regionID]["long"] = row[3];
      }
      data[regionID][dataObj[key].type] = {};
      dates.forEach((d, i) => {
        const dateKey = moment(d, "M/D/YY").format("YYYYMMDD");
        data[regionID][dataObj[key].type][dateKey] = dataByDate[i];
      });
    });
  }

  return data;
};

casesByRegionSchema.statics.updateFromDataPull = function(dataObj) {
  const formattedData = this.formatDataPull(dataObj);
  try {
    Object.keys(formattedData).forEach(async key => {
      let region = await CasesByRegion.findOne({ uniqueKey: key });

      if (region) {
        region.casesByDate = formattedData[key].cases;
        region.deathsByDate = formattedData[key].deaths;
        region.recoveredByDate = formattedData[key].recovered;
      } else {
        region = new CasesByRegion({
          uniqueKey: key,
          country: formattedData[key].country,
          province: formattedData[key].province,
          lat: formattedData[key].lat,
          long: formattedData[key].long,
          casesByDate: formattedData[key].cases,
          deathsByDate: formattedData[key].deaths,
          recoveredByDate: formattedData[key].recovered
        });
      }

      return await region.save();
    });
  } catch (err) {
    logError(
      `CasesByRegion::updateFromDataPull::Error storing data from datapull = ${err}`
    );
  }
};

export const CasesByRegion = mongoose.model(
  "casesByRegion",
  casesByRegionSchema
);
