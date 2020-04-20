import csvParse from "async-csv";
import fs from "fs";
import { CasesByCounty } from "../../models";

import mongoose from "mongoose";
import { dbg, logJob } from "../tools";

const files = process.argv.slice(2);

require("dotenv").config();

(async () => {
    mongoose
        .connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        })
        .then(async () => {
            dbg("MongoDB connected");


            const stateFIPSBuffer = fs.readFileSync(files[0]);

            const stateFIPS = await csvParse.parse(stateFIPSBuffer.toString());

            const statesResult = stateFIPS.reduce((acc, line, i) => {
                if (i > 0) {
                    if (parseInt(line[1]) === 0) {
                        if (parseInt(line[2]) === 0) {
                            // region header
                            acc.lookup[line[0]] = {
                                name: line[3],
                                subs: {}
                            }
                        }
                    } else {
                        if (parseInt(line[2]) === 0) {
                            // division header
                            acc.lookup[line[0]].subs[line[1]] = {
                                name: line[3],
                                subs: {}
                            }
                        } else {
                            // state header
                            acc.lookup[line[0]].subs[line[1]].subs[line[2]] = { name: line[3] };
                            acc.states[line[2]] = {
                                region: {
                                    fips: line[0],
                                    name: acc.lookup[line[0]].name
                                },
                                division: {
                                    fips: line[1],
                                    name: acc.lookup[line[0]].subs[line[1]].name
                                },
                                name: line[3],
                                fips: line[2]
                            }
                        }
                    }
                }
                // console.log(acc);
                return acc;
            }, { lookup: {}, states: {} });

            //console.log(JSON.stringify(statesResult, null, 2));

            const countiesFIPSBuffer = fs.readFileSync(files[1]);

            const countiesFIPS = await csvParse.parse(countiesFIPSBuffer.toString());

            const countiesResult = countiesFIPS.reduce((acc, line, i) => {
                if (line[0] === "050") {
                    //console.log(statesResult.states[line[1]]);
                    if (statesResult.states[line[1]]) {
                        acc.push({
                            county: line[6].replace(" County", "").replace(" Parish", "").replace(" City and Borough", "").replace(" city", " City").replace(" Borough", "").replace(" Census Area", "").replace(" Municipality", ""),
                            countyFIPS: line[2],
                            state: statesResult.states[line[1]].name,
                            stateFIPS: line[1],
                            region: statesResult.states[line[1]].region.name,
                            regionFIPS: statesResult.states[line[1]].region.fips,
                            division: statesResult.states[line[1]].division.name,
                            divisionFIPS: statesResult.states[line[1]].division.fips
                        });
                    }
                }

                return acc;
            }, []);

            await Promise.all(countiesResult.map(async county => {
                await CasesByCounty.addFIPS(county.state, county.county, county.region, county.division, county.regionFIPS, county.divisionFIPS, county.stateFIPS, county.countyFIPS);
            }));

            logJob("Job completed: addFIPS").then(() => {
                mongoose.disconnect();
                process.exit();
            });
        })
        .catch(err => console.log(err));

})();





