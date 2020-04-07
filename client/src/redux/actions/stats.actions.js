import { statsConstants, serviceConstants } from "../constants";
import { statsServices } from "../../services";

const getStates = () => {
    return dispatch => {
        dispatch({ type: statsConstants.STATS_GET_STATES });
        dispatch({ type: serviceConstants.POSTBACK_BEGIN });

        return statsServices
            .getStates()
            .then(data => {
                dispatch({ type: serviceConstants.POSTBACK_END });
                return data;
            }).catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
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
                return data;
            })
            .catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
            })
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
                return data;
            })
            .catch(err => {
                dispatch({ type: serviceConstants.POSTBACK_ERROR });
            })
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
    getCasesByCounty
};