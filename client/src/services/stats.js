import { dbg } from "../utils";
import axios from "axios";

const getStates = () => {
    return axios.get("/api/stats/us/state-list").then(res => {
        dbg("statsServices::getStates response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg("statsServices::getStates error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getCounties = (state) => {
    return axios.get(`/api/stats/us/county-list/${state}`).then(res => {
        dbg("statsServices::getCounties response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg("statsServices::getCounties error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

const getCasesByCounty = (stateName, countyName) => {
    return axios.get(`/api/stats/us/cases-by-county/${stateName}/${countyName}`).then(res => {
        dbg("statsServices::getCasesByCounty response", res);

        if (res.status === 200) {
            return res.data;
        }
    }).catch(error => {
        dbg("statsServices::getCasesByCounty error", error);
        const err = Error("Stats error");
        err.data = error.response.data;
        throw err;
    })
}

export const statsServices = {
    getStates,
    getCounties,
    getCasesByCounty
}