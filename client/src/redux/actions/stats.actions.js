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

const getCountiesSorted = (stateName, sort) => {
    return dispatch => {
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices.getCountiesSorted(stateName, sort).then(data => {
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
    getCountiesSorted,
    getLastUpdated
};