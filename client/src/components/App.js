import React, { Component } from "react";
import { connect } from "react-redux";
import { Router } from "react-router-dom";

import moment from "moment";
import ReactGA from "react-ga";

import { dbg, history } from "../utils";

import {
  alertActions,
  navActions,
  installActions,
  logActions,
  geolocActions,
  statsActions,
} from "../redux/actions";

import Header from "../components/presentation/parts/Header";
import Footer from "../components/presentation/parts/Footer";
import ConnectedNav from "./connected/parts/ConnectedNav";
import Announcement from "./presentation/parts/Announcement";
import TransitionRoute from "./presentation/parts/TransitionRoute";

// Pages
import HomePage from "./connected/pages/HomePage";
import AdminPage from "./connected/pages/AdminPage";
import ProfilePage from "./connected/pages/ProfilePage";
import SignInPage from "./connected/pages/SignInPage";
import InstallPage from "./connected/pages/InstallPage";
import RegisterPage from "./connected/pages/RegisterPage";
import GraphPage from "./connected/pages/GraphPage";
import StatePage from "./connected/pages/StatePage";
import NotFoundPage from "./connected/pages/NotFound";

require("dotenv").config();

class App extends Component {
  componentDidMount = () => {
    dbg.log("App::componentDidMount props", this.props);
    dbg.log("App::componentDidMount history post App mount", history);
    this.props.announce("Here is a site wide announcement");

    this.props.getLastUpdated().then(() => {
      this.props.announce(
        `Last update: ${moment(this.props.statsLastUpdated).format(
          "MMM DD YYYY h:mm a"
        )}`
      );
    });

    ReactGA.initialize(process.env.REACT_APP_GA);

    if (!this.props.geoloc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.handleGeoLocation,
        function() {
          /*no op*/
        }
      );
    }
    history.listen(this.handleLocationChange);

    this.handleLocationChange(history.location, "PUSH");
  };

  handleGeoLocation = (position) => {
    this.props
      .lookupUserLocation(position.coords.latitude, position.coords.longitude)
      .then((data) => {
        if (data) {
          ReactGA.event({
            category: "GeoLoc",
            action: "lookup",
            label: `${data.address.city}, ${data.address.county}, ${data.address.state}`,
          });
        }
      });
  };

  handleLocationChange = (location, action) => {
    dbg.log("App::handleLocationChange Changing location app", location);
    const { nav, locationChange, clearAlert, captureUserEvent } = this.props;

    captureUserEvent({ type: "navigation", path: location.pathname });
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);

    if (location.pathname === "/install") {
      this.props.checkInstallation();
    }

    //////////////////////////////////////////////////////////////////////
    // TODO refactor the authorization to paths
    // PrivateRoutes do not work with the CSSTransitions
    if (this.props.isAuthd && location.pathname === "/signin") {
      history.push("/");
    }

    clearAlert();
    if (
      !this.props.isAuthd &&
      (location.pathname.startsWith("/admin") ||
        location.pathname === "/profile")
    ) {
      history.push("/signin");
      this.props.errorAlert("Please sign in for access");
    }

    const activeNavKey = this.getActiveNavKey(nav.menu, location);
    locationChange(activeNavKey);
    ////////////////////////////////////////////////////////////////////////

    const pageLabel = nav.menu[activeNavKey]
      ? ` - ${nav.menu[activeNavKey].label}`
      : "";
    document.title = `${this.props.appName}${pageLabel}`;
  };

  getActiveNavKey = (menu, location) => {
    const active = Object.keys(menu).filter(
      (key) => menu[key].path === location.pathname
    );

    return active.length > 0 ? active[0] : null;
  };

  render() {
    const topNav = <ConnectedNav />;
    const { announcement } = this.props;

    // TODO refactor the route paths list. This is needed for the
    // catch all route. Router Switch doesn't work with the CSSTransitions
    const routePaths = [
      "/",
      "/signin",
      "/signin/",
      "/admin",
      "/admin/",
      "/profile",
      "/register",
      "/register/",
      "/install",
      "/state/:state",
      "/county/:state/:county",
    ];

    const { geoloc } = this.props;

    return (
      <div className="App">
        {announcement && announcement.message && (
          <Announcement
            type={announcement.type}
            message={announcement.message}
          />
        )}

        {geoloc ? (
          <div className="geolocation-bar alert-secondary text-center py-3">
            <strong>Your location:</strong> {geoloc.address.city},{" "}
            {geoloc.address.county} County, {geoloc.address.state}
          </div>
        ) : (
          ""
        )}

        <Router history={history}>
          <Header nav={topNav} />
          <TransitionRoute exact path="/" component={HomePage} />
          <TransitionRoute exact path="/signin" component={SignInPage} />
          <TransitionRoute exact path="/register" component={RegisterPage} />
          <TransitionRoute exact path="/admin" component={AdminPage} />
          <TransitionRoute exact path="/profile" component={ProfilePage} />
          <TransitionRoute exact path="/install" component={InstallPage} />
          <TransitionRoute path="/state/:state" component={StatePage} />
          <TransitionRoute
            path="/county/:state/:county"
            component={GraphPage}
          />
          <TransitionRoute routePaths={routePaths} component={NotFoundPage} />
          <Footer />
        </Router>
      </div>
    );
  }
}

const mapStateToProps = ({ alert, auth, nav, stats, service }) => {
  return {
    isAuthd: auth.authenticated,
    announcement: alert.announcement,
    nav,
    appName: nav.brand.label,
    geoloc: service.geoloc,
    statsLastUpdated: stats.lastUpdated,
  };
};

const actionCreators = {
  announce: alertActions.announce,
  clearAlert: alertActions.clearAlert,
  locationChange: navActions.locationChanged,
  errorAlert: alertActions.error,
  checkInstallation: installActions.checkInstallation,
  captureUserEvent: logActions.captureUserEvent,
  getLastUpdated: statsActions.getLastUpdated,
  lookupUserLocation: geolocActions.lookupUserLocation,
};

const ConnectedApp = connect(mapStateToProps, actionCreators)(App);

export default ConnectedApp;
