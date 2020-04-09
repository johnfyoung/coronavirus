import React, { Component } from "react";
import { CSSTransition } from "react-transition-group";
import { Route } from "react-router-dom";
import { isEmpty, dbg } from "../../../utils";

class TransitionRoute extends Component {
  render() {
    const { component: Component, path, routePaths, ...rest } = this.props;
    if (isEmpty(path)) {

      return (
        <Route routePaths={routePaths}>
          {routeProps => {
            const pathParts = routeProps.location.pathname.split("/");
            dbg.log("pathParts", pathParts);
            if (routePaths.filter(p => {
              const routeParts = p.split("/");
              dbg.log("routeParts", routeParts);
              const result = routeParts.filter((rp, i) => {
                return ((rp === pathParts[i]) || rp.startsWith(":"));
              });
              return result.length === pathParts.length;
            }).length === 0) {

              return (
                <CSSTransition
                  in={routeProps.match != null}
                  timeout={300}
                  classNames="fade"
                  unmountOnExit
                >
                  <Component />
                </CSSTransition>
              );
            } else {
              return <div></div>;
            }
          }}
        </Route>
      );
    } else {
      return (
        <Route {...rest} path={path}>
          {({ match }) => (
            <CSSTransition
              in={match != null}
              timeout={300}
              classNames="fade"
              unmountOnExit
            >
              <Component match={match} />
            </CSSTransition>
          )}
        </Route>
      );
    }
  }
}

export default TransitionRoute;
