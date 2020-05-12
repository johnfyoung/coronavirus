import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { mean } from "simple-statistics";
import moment from "moment";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import DataGraph from "../../presentation/parts/DataGraph";
import TotalsGraph from "../../presentation/parts/TotalsGraph";
import { dbg } from "../../../utils";
import { statsActions } from "../../../redux/actions";

import ReactGA from "react-ga";

class HomePage extends Component {
  state = {
    sort: "deaths",
    sortDirection: "desc",
    sortedData: [],
    totals: []
  }

  componentDidMount() {
    dbg.log("Mounting Home page");
    const { getStatesSorted, getTotals } = this.props;
    const { sort, sortDirection } = this.state;

    getTotals().then(totalsResult => {
      dbg.log("Got the totals", totalsResult);
      this.setState({ totals: this.formatTotals(totalsResult) }, () => {
        getStatesSorted(sort, sortDirection).then(result => {
          dbg.log("Got the sortedStates data", result);
          this.setState({ sortedData: result });
        });
      });
    });
  }

  componentDidUpdate(prevProps) {
    dbg.log("Updating Home page");
  }

  formatTotals(unFormattedData) {
    const keys = Object.keys(unFormattedData);
    return keys.map((k, i) => {
      const casesMovingAvg = i > 1 ? (mean([unFormattedData[keys[i - 2]].casesRate, unFormattedData[keys[i - 1]].casesRate, unFormattedData[k].casesRate]) * 100).toFixed(2) : .0001;
      const deathsMovingAvg = i > 1 ? (mean([unFormattedData[keys[i - 2]].deathsRate, unFormattedData[keys[i - 1]].deathsRate, unFormattedData[k].deathsRate]) * 100).toFixed(2) : .0001;
      return {
        name: moment(k, "YYYYMMDD").format("MMM-DD"),
        ...unFormattedData[k],
        cases: unFormattedData[k].cases === 0 ? .0001 : unFormattedData[k].cases,
        deaths: unFormattedData[k].deaths === 0 ? .0001 : unFormattedData[k].deaths,
        casesNew: unFormattedData[k].casesNew === 0 ? .0001 : unFormattedData[k].casesNew,
        casesMovingAvg: casesMovingAvg === 0 ? .0001 : casesMovingAvg,
        deathsMovingAvg: deathsMovingAvg === 0 ? .0001 : deathsMovingAvg
      }
    });
  }

  handleSortClick = (newSort, ev) => {
    ev.preventDefault();
    const { getStatesSorted } = this.props;
    let { sort, sortDirection } = this.state;

    if (sort === newSort) {
      sortDirection = sortDirection === "desc" ? "asc" : "desc";
    }

    getStatesSorted(newSort, sortDirection).then(result => {
      //dbg.log("Got the sortedStates data", result);
      this.setState({ sort: newSort, sortDirection, sortedData: result });
    });

  };

  render() {
    const { sort, sortDirection, sortedData, totals } = this.state;

    return (
      <ConnectedPage pageClass="page-home" nav={this.props.nav} >
        <div className="row">
          <div className="col-12">
            <h1>Coronavirus Stats</h1>
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="states-tab" data-toggle="tab" href="#states" role="tab" aria-controls="states" aria-selected="false">By State</a>
              </li>
            </ul>
            <div class="tab-content" id="myTabContent">
              <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                {totals.length > 0 ? (
                  <TotalsGraph data={totals} />
                ) : (
                    "Loading..."
                  )}
              </div>
              <div class="tab-pane fade" id="states" role="tabpanel" aria-labelledby="states-tab">
                {sortedData.length > 0 ? (
                  <table className="table table-striped data-table">
                    <thead className="thead-dark">
                      <tr>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("name", ev)}>
                            <span className={(sort === "name" ? (sortDirection === "desc" ? "arrow-down" : "arrow-up") : "")}>State</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("cases", ev)}>
                            <span className={(sort === "cases" ? (sortDirection === "desc" ? "arrow-down" : "arrow-up") : "")}>Case Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("deaths", ev)}>
                            <span className={(sort === "deaths" ? (sortDirection === "desc" ? "arrow-down" : "arrow-up") : "")}>Death Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("casesPer100k", ev)}>
                            <span className={(sort === "casesPer100k" ? (sortDirection === "desc" ? "arrow-down" : "arrow-up") : "")}>Cases Per 100k</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("deathsPer100k", ev)}>
                            <span className={(sort === "deathsPer100k" ? (sortDirection === "desc" ? "arrow-down" : "arrow-up") : "")}>Deaths Per 100k</span>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map(stateData => (
                        <tr key={stateData.state}>
                          <td><Link to={`/state/${stateData.state}`} className="btn btn-link">{stateData.state}</Link></td>
                          <td className="data-table-number">{stateData.totalCases.toLocaleString()}</td>
                          <td className="data-table-number">{stateData.totalDeaths.toLocaleString()}</td>
                          <td className="data-table-number">{Math.round(stateData.totalCasesPer100k).toLocaleString()}</td>
                          <td className="data-table-number">{Math.round(stateData.totalDeathsPer100k).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                    <table>
                      <tbody>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                        <tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr><tr>
                          <td className="td-1"><span></span></td>
                          <td className="td-2"><span></span></td>
                          <td className="td-3"><span></span></td>
                          <td className="td-5"><span></span></td>
                        </tr>
                      </tbody>
                    </table>)}
              </div>
            </div>
          </div>
        </div>
      </ConnectedPage >
    );
  }

}

const mapStateToProps = ({ service, loading, stats }) => ({
  service,
  loading,
  stats,
  geoloc: service.geoloc,
  currentCounty: stats.currentCounty,
  currentState: stats.currentState,
});

const actionCreators = {
  getStatesSorted: statsActions.getStatesSorted,
  getTotals: statsActions.getTotals
};

export default connect(
  mapStateToProps,
  actionCreators
)(HomePage);