import mongoose, {
  Schema
} from "mongoose";
import {
  fieldNamesByCounty
} from "../config/constants";
import {
  logError,
  dbg
} from "../util/tools";
import moment from "moment";
import {
  harmonicMean
} from "simple-statistics";
import {
  add
} from "winston";

const casesByCountySchema = new Schema({
  uniqueKey: String,
  uid: Number,
  county: String,
  state: String,
  region: String,
  lat: Number,
  long: Number,
  casesByDate: Array,
  deathsByDate: Array,
  regionName: String,
  divisionName: String,
  regionFIPS: String,
  divisionFIPS: String,
  stateFIPS: String,
  countyFIPS: String,
  population: Number,
  dataPull: {
    type: Schema.Types.ObjectId,
    ref: "DataPull"
  }
});

const makeUniqueKey = function (country, state, county) {
  return `${country
    .toLowerCase()
    .replace(/[\s'()]/g, "")}_${state
      .toLowerCase()
      .replace(/[\s'()]/g, "")}_${county
        .toLowerCase()
        .replace(/[\s'()]/g, "")}`;
};

casesByCountySchema.statics.getCasesSorted = async function (state, sort = "count", dateStr = "") {
  const match = {
    state
  };
  const sortQuery = sort === "count" ? {
    currentCasesCount: -1
  } : {
      currentMovingAvg: -1
    };
  const formattedDate = dateStr ? moment(dateStr).format("YYYYMMDD") : moment().format("YYYYMMDD");
  const formattedDateMinusTwo = dateStr ? moment(dateStr).subtract(2, "d").format("YYYYMMDD") : moment().subtract(2, "d").format("YYYYMMDD");

  return await this.aggregate([{
    $match: match
  },
  {
    $unwind: "$casesByDate"
  },
  {
    $addFields: {
      currentCasesCount: {
        $toInt: `$casesByDate.${formattedDate}.count`
      },
      currentMovingAvg: {
        $toDouble: `$casesByDate.${formattedDateMinusTwo}.movingAvg`
      }
    }
  },
  {
    $sort: sortQuery
  }
  ]);
};

const createDateList = (startDate, endDate) => {
  const dates = [];
  let currentDateMoment = moment(startDate);
  const endDateMoment = moment(endDate, "YYYYMMDD");
  while (currentDateMoment.isSameOrBefore(endDateMoment)) {
    dates.push(currentDateMoment.format("YYYYMMDD"));
    currentDateMoment = currentDateMoment.add(1, "day");
  }

  return dates;
};

casesByCountySchema.statics.getTotals = async function (startDate = "20200122", endDate = moment().subtract(1, "day").format("YYYYMMDD"), stateName = null, countyName = null) {
  const addFieldsExpression = {};
  const groupExpression = {
    _id: "Totals"
  };
  const projectionExpression = {
    byDate: {}
  };
  const dateStrings = createDateList(startDate, endDate);

  if (moment(startDate, "YYYYMMDD").isAfter(moment("20200122", "YYYYMMDD"))) {
    const leadingDay = moment(startDate, "YYYYMMDD").subtract(1, "day").format("YYYYMMDD");
    addFieldsExpression[`cases_${leadingDay}`] = {
      $toInt: `$casesByDate.${leadingDay}.count`
    };
    addFieldsExpression[`deaths_${leadingDay}`] = {
      $toInt: `$deathsByDate.${leadingDay}.count`
    };
    groupExpression[`${leadingDay}_cases`] = {
      $sum: `$cases_${leadingDay}`
    };
    groupExpression[`${leadingDay}_deaths`] = {
      $sum: `$deaths_${leadingDay}`
    };
  }

  dateStrings.map((d, i) => {
    const precedingDay = moment(d, "YYYYMMDD").subtract(1, "day").format("YYYYMMDD");
    addFieldsExpression[`cases_${d}`] = {
      $toInt: `$casesByDate.${d}.count`
    };
    addFieldsExpression[`deaths_${d}`] = {
      $toInt: `$deathsByDate.${d}.count`
    };
    groupExpression[`${d}_cases`] = {
      $sum: `$cases_${d}`
    };
    groupExpression[`${d}_deaths`] = {
      $sum: `$deaths_${d}`
    };
    projectionExpression.byDate[d] = {
      cases: `$${d}_cases`,
      casesNew: {
        $subtract: [`$${d}_cases`, `$${precedingDay}_cases`]
      },
      casesRate: {
        $cond: [{
          $eq: [
            `$${precedingDay}_cases`, 0
          ]
        },
          0,
        {
          $divide: [{
            $subtract: [
              `$${d}_cases`,
              `$${precedingDay}_cases`
            ]
          },
          `$${precedingDay}_cases`
          ]
        }
        ]
      },
      deaths: `$${d}_deaths`,
      deathsNew: {
        $subtract: [`$${d}_deaths`, `$${precedingDay}_deaths`]
      },
      deathsRate: {
        $cond: [{
          $eq: [
            `$${precedingDay}_deaths`, 0
          ]
        },
          0,
        {
          $divide: [{
            $subtract: [
              `$${d}_deaths`,
              `$${precedingDay}_deaths`
            ]
          },
          `$${precedingDay}_deaths`
          ]
        }
        ]
      }
    }
  });

  const aggregationPipeline = [{
    $unwind: "$casesByDate"
  },
  {
    $unwind: "$deathsByDate"
  },
  {
    $addFields: addFieldsExpression
  },
  {
    $group: groupExpression
  },
  {
    $project: projectionExpression
  }
  ];

  if (stateName) {

    const matchQuery = {
      $match: {
        state: {
          $regex: stateName,
          $options: "i"
        }
      }
    };

    if (countyName) {
      matchQuery.$match.county = {
        $regex: countyName,
        $options: "i"
      };
    }
    aggregationPipeline.unshift(matchQuery);
  }


  return await this.aggregate(aggregationPipeline);
};

casesByCountySchema.statics.getStateCasesSorted = async function (sort = "cases", direction = "desc", dateStr = "") {
  const dir = direction === "desc" ? -1 : 1;
  const sortQuery = sort === "cases" ? {
    totalCases: dir
  } : {
      totalDeaths: dir
    };
  const formattedDate = dateStr ? moment(dateStr).format("YYYYMMDD") : moment().format("YYYYMMDD");

  return await this.aggregate([{
    $unwind: "$casesByDate"
  },
  {
    $unwind: "$deathsByDate"
  },
  {
    $addFields: {
      currentCasesCount: {
        $toInt: `$casesByDate.${formattedDate}.count`
      },
      currentDeathsCount: {
        $toInt: `$deathsByDate.${formattedDate}.count`
      }
    }
  },
  {
    $group: {
      _id: {
        state: "$state"
      },
      totalCases: {
        $sum: "$currentCasesCount"
      },
      totalDeaths: {
        $sum: "$currentDeathsCount"
      },
      totalPopulation: {
        $sum: "$population"
      }
    }
  },
  {
    $project: {
      state: "$_id.state",
      totalCases: 1,
      totalDeaths: 1,
      totalPopulation: 1,
      totalCasesPer100k: {
        $cond: [
          {
            $eq: [
              "$totalPopulation",
              0
            ]
          },
          0,
          {
            $divide: [
              "$totalCases",
              {
                $divide: [
                  "$totalPopulation",
                  100000
                ]
              }
            ]
          }
        ]
      }
    }
  },
  {
    $sort: sortQuery
  }
  ]);
};

casesByCountySchema.statics.formatDataPull = dataObj => {
  const data = {};
  for (const key of Object.keys(dataObj)) {
    const dates = dataObj[key].data.shift().slice(11);
    // names[dataObj[key].type] = [];
    dataObj[key].data.forEach(row => {
      const regionID = makeUniqueKey(row[7], row[6], row[5]);
      const dataByDate = row.slice(11);
      if (!data[regionID]) {
        data[regionID] = {};
        data[regionID]["uid"] = row[0];
        data[regionID]["region"] = row[7];
        data[regionID]["state"] = row[6];
        data[regionID]["county"] = row[5];
        data[regionID]["lat"] = row[8];
        data[regionID]["long"] = row[9];
      }
      data[regionID][dataObj[key].type] = {};

      let sumOfRates = 0;
      const rates = [];

      dates.forEach((d, i) => {
        const dateKey = moment(d, "M/D/YY").format("YYYYMMDD");

        if (dateKey !== "Invalid date") {
          let rate = 0;

          rate = i > 0 ? (dataByDate[i] - dataByDate[i - 1]) / dataByDate[i - 1] : 0;
          if (rate > 0) {
            rates.push(rate);
          }


          let movingAvg = rates.length >= 5 ? harmonicMean(rates.slice(rates.length - 5)) : 0;
          if (i > 1) {
            const keyOfPrevDate = Object.keys(data[regionID][dataObj[key].type])[i - 2];
            data[regionID][dataObj[key].type][keyOfPrevDate].movingAvg = movingAvg;
          }

          sumOfRates += rate;
          data[regionID][dataObj[key].type][dateKey] = {
            count: dataByDate[i],
            rate,
            sma: sumOfRates / (i + 1),
            harm: rates.length > 0 ? harmonicMean(rates) : 0
          };
        }
      });
    });
  }

  return data;
};

casesByCountySchema.statics.updateFromDataPull = async function (dataObj, dPull) {
  dbg("Updating CasesByCounty");
  const formattedData = this.formatDataPull(dataObj);
  try {
    await Promise.all(Object.keys(formattedData).map(async key => {
      let county = await CasesByCounty.findOne({
        uniqueKey: key
      });

      //dbg("County result", county);
      if (county) {
        //dbg("Got a county!");
        county.casesByDate = formattedData[key].cases;
        county.deathsByDate = formattedData[key].deaths;
        county.dataPull = dPull;
      } else {
        county = new CasesByCounty({
          uniqueKey: key,
          uid: formattedData[key].uid,
          region: formattedData[key].region,
          state: formattedData[key].state,
          county: formattedData[key].county,
          lat: formattedData[key].lat,
          long: formattedData[key].long,
          casesByDate: formattedData[key].cases,
          deathsByDate: formattedData[key].deaths,
          dataPull: dPull
        });
      }

      return await county.save();
    }));
  } catch (err) {
    logError(
      `CasesByCounty::updateFromDataPull::Error storing data from datapull = ${err}`
    );
  }
};

casesByCountySchema.statics.getByDataPulls = function (dataPulls = null) {
  if (!dataPulls) {
    logError("CasesByCounty::getByDataPulls::Missing dataPulls list");
    return;
  }

  const result = this.aggregate([{
    $match: {
      dataPull: {
        $in: dataPulls
      }
    }
  }]);

  return this.populate(result, {
    path: "dataPull"
  });
};

casesByCountySchema.statics.addFIPS = async function (stateName, countyName, regionName, divisionName, regionFIPS, divisionFIPS, stateFIPS, countyFIPS) {
  try {
    let county = await CasesByCounty.findOne({
      state: stateName,
      county: countyName
    });

    //dbg("County result", county);
    if (county) {
      //dbg("Got a county!");
      county.regionName = regionName;
      county.divisionName = divisionName;
      county.regionFIPS = regionFIPS;
      county.divisionFIPS = divisionFIPS;
      county.stateFIPS = stateFIPS;
      county.countyFIPS = countyFIPS;

      return await county.save();
    } else {
      console.log(`missing county ${stateName} ${countyName}`);
    }

  } catch (err) {
    logError(`CasesByCounty::addFIPS::error adding FIPS data to ${countyName}: ${err}`);
  }
}

casesByCountySchema.statics.updatePopulation = async function (population, stateFIPS, countyFIPS) {
  try {
    let county = await CasesByCounty.findOne({
      stateFIPS,
      countyFIPS
    });

    //dbg("County result", county);
    if (county) {
      //dbg("Got a county!");
      county.population = population;

      return await county.save();
    } else {
      console.log(`missing county State FIPS: ${stateFIPS}, County FIPS: ${countyFIPS}`);
    }

  } catch (err) {
    logError(`CasesByCounty::updatePopulation::error adding population data to State FIPS: ${stateFIPS}, County FIPS: ${countyFIPS}: ${err}`);
  }
}

export const CasesByCounty = mongoose.model(
  "casesByCounty",
  casesByCountySchema
);