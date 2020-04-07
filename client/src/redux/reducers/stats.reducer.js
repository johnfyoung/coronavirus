import { statsConstants } from "../constants";

const initialState = { currentState: "", currentCounty: "", lastUpdated: "" };

export const stats = function (state = initialState, action) {
    switch (action.type) {
        case statsConstants.STATS_GET_STATES:
            return {
                ...state,
                currentCounty: "",
                currentState: ""
            };
        case statsConstants.STATS_GET_COUNTIES:
            return {
                ...state,
                currentCounty: ""
            };
        case statsConstants.STATS_SELECT_STATE:
            return {
                ...state,
                currentCounty: "",
                currentState: action.payload
            };
        case statsConstants.STATS_SELECT_COUNTY:
            return {
                ...state,
                currentCounty: action.payload
            };
        case statsConstants.STATS_GET_LASTUPDATED:
            return {
                ...state,
                lastUpdated: action.payload
            };
        default:
            return state;
    }
}