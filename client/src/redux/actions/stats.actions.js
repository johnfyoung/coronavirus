import { statsConstants, serviceConstants } from "../constants";
import { statsServices } from "../../services";
import { dbg } from "../../utils";

const getStates = () => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_GET_STATES });
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices
            .getStates()
            .then(data => {
                dispatch({ type: serviceConstants.POSTBACK_END });
                dispatch({ type: statsConstants.STATS_SUCCESS });
                return data;
            }).catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
                dispatch({ type: statsConstants.STATS_FAILURE });
            }).finally(() => {
                dispatch({ type: serviceConstants.POSTBACK_END });
            });
    }
}

const getCounties = (stateName) => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_GET_COUNTIES, payload: stateName });
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices
            .getCounties(stateName)
            .then(data => {
                dispatch({ type: serviceConstants.POSTBACK_END });
                dispatch({ type: statsConstants.STATS_SUCCESS });
                return data;
            })
            .catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
                dispatch({ type: statsConstants.STATS_FAILURE });
            }).finally(() => {
                dispatch({ type: serviceConstants.POSTBACK_END });
            });
    }
}

const getCasesByCounty = (stateName, countyName) => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_GET_CASESBYCOUNTY });
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices
            .getCasesByCounty(stateName, countyName)
            .then(data => {
                dispatch({ type: serviceConstants.POSTBACK_END });
                dispatch({ type: statsConstants.STATS_SUCCESS });
                return data;
            })
            .catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
                dispatch({ type: statsConstants.STATS_FAILURE });
            }).finally(() => {
                dispatch({ type: serviceConstants.POSTBACK_END });
            });
    }
}

const getCasesByState = (stateName) => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_GET_CASESBYSTATE });
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices
            .getTotals(stateName)
            .then(data => {
                dispatch({ type: serviceConstants.POSTBACK_END });
                dispatch({ type: statsConstants.STATS_SUCCESS });
                return data;
            })
            .catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
                dispatch({ type: statsConstants.STATS_FAILURE });
            }).finally(() => {
                dispatch({ type: serviceConstants.POSTBACK_END });
            });
    }
};

const getLastUpdated = () => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getLastUpdated().then(data => {
            dispatch({ type: statsConstants.STATS_GET_LASTUPDATED, payload: data });
            dispatch({ type: statsConstants.STATS_SUCCESS });
        }).catch(err => {
            dispatch({ type: statsConstants.STATS_FAILURE });
            dispatch({ type: serviceConstants.POSTBACK_ERROR });
        }).finally(() => {
            dispatch({ type: serviceConstants.POSTBACK_END });
        });
    }
}

const getCountiesSorted = (stateName, sort, direction) => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getCountiesSorted(stateName, sort, direction).then(data => {
            dispatch({ type: statsConstants.STATS_GET_CASESBYCOUNTY_SORTED, payload: data });
            dispatch({ type: statsConstants.STATS_SUCCESS });
            return data;
        }).catch(err => {
            dispatch({ type: statsConstants.STATS_FAILURE });
            dispatch({ type: serviceConstants.POSTBACK_ERROR });
        }).finally(() => {
            dispatch({ type: serviceConstants.POSTBACK_END });
        });
    }
}

const getStatesSorted = (sort, direction) => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getStatesSorted(sort, direction).then(data => {
            dispatch({ type: statsConstants.STATS_GET_CASESBYSTATE_SORTED, payload: data });
            dispatch({ type: statsConstants.STATS_SUCCESS });
            return data;
        }).catch(err => {
            dispatch({ type: statsConstants.STATS_FAILURE });
            dispatch({ type: serviceConstants.POSTBACK_ERROR });
        }).finally(() => {
            dispatch({ type: serviceConstants.POSTBACK_END });
        });
    }
}

const getTotals = (state, county, startDate, endDate) => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getTotals(state, county, startDate, endDate).then(data => {
            dispatch({ type: statsConstants.STATS_GET_CASESBYSTATE_SORTED, payload: data });
            dispatch({ type: statsConstants.STATS_SUCCESS });
            return data;
        }).catch(err => {
            dispatch({ type: statsConstants.STATS_FAILURE });
            dispatch({ type: serviceConstants.POSTBACK_ERROR });
        }).finally(() => {
            dispatch({ type: serviceConstants.POSTBACK_END });
        });
    }
}

const getSnapshot = (sort, dir, date) => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getSnapshot(sort, dir, date).then(data => {
            dispatch({ type: statsConstants.STATS_GET_BYDATE, payload: data });
            dispatch({ type: statsConstants.STATS_SUCCESS });
            return data;
        }).catch(err => {
            dispatch({ type: statsConstants.STATS_FAILURE });
            dispatch({ type: serviceConstants.POSTBACK_ERROR });
        }).finally(() => {
            dispatch({ type: serviceConstants.POSTBACK_END });
        });
    }
}

const selectState = (stateName) => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_SELECT_STATE, payload: stateName });
    }
}

const selectCounty = (countyName) => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_SELECT_COUNTY, payload: countyName });
    }
}

export const statsActions = {
    getStates,
    getCounties,
    selectState,
    selectCounty,
    getCasesByCounty,
    getCasesByState,
    getCountiesSorted,
    getLastUpdated,
    getStatesSorted,
    getTotals,
    getSnapshot
};