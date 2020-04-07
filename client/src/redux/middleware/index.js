import { applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { logger, userEvent } from "./logger";

// Redux Thunk middleware allows you to write action creators that return a function instead of an action

// React Dev Tools are not installed in all browsers. This checks for React Dev Tools.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default composeEnhancers(
  applyMiddleware(thunk, logger, userEvent)
);
