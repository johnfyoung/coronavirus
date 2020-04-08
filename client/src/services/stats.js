import { dbg } from "../utils";
import axios from "axios";

const getStates = () => {
    return axios.get("/api/stats/us/state-list").then(res => {
        dbg.log("statsServices::getStates response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg.log("statsServices::getStates error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getCounties = (state) => {
    return axios.get(`/api/stats/us/county-list/${state}`).then(res => {
        dbg.log("statsServices::getCounties response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg.log("statsServices::getCounties error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getCasesByCounty = (stateName, countyName) => {
    return axios.get(`/api/stats/us/cases-by-county/${stateName}/${countyName}`).then(res => {
        dbg.log("statsServices::getCasesByCounty response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg.log("statsServices::getCasesByCounty error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getLastUpdated = () => {
    return axios.get("/api/stats/us/last-updated").then(res => {
        dbg.log("statsServices::getLastUpdated response", res);
        if (res.status === 200) {
            return res.data.pullTime;
        }
    }).catch(error => {
        dbg.log("statsServices::getLastUpdated error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    });
};

export const statsServices = {
    getStates,
    getCounties,
    getCasesByCounty,
    getLastUpdated
}