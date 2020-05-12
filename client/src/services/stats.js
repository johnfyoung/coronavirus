import { dbg } from "../utils";
import axios from "axios";
import { sortMethods } from "../config/constants";

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

const getCountiesSorted = (stateName, sort = sortMethods.CASES, direction = "desc", date) => {
    return axios.get(`/api/stats/us/cases-by-county-sorted/${stateName}`, {
        params: {
            sort,
            direction,
            date
        }
    }).then(res => {
        dbg.log("statsServices::getCountiesSorted response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg.log("statsServices::getCountiesSorted error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getStatesSorted = (sort = "casesCount", direction = "desc") => {
    return axios.get(`/api/stats/us/cases-by-state-sorted`, {
        params: {
            sort,
            direction
        }
    }).then(res => {
        dbg.log("statsServices::getStatesSorted response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg.log("statsServices::getStatesSorted error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getTotals = (state, county, start, end) => {
    return axios.get(`/api/stats/us/cases-totals`, {
        params: {
            state,
            county,
            start,
            end
        }
    }).then(res => {
        dbg.log("statsServices::getTotals response", res);

        if (res.status === 200) {
            return res.data[0].byDate;
        }
    }).catch(error => {
        dbg.log("statsServices::getTotals error", error);
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
    getLastUpdated,
    getCountiesSorted,
    getStatesSorted,
    getTotals
}