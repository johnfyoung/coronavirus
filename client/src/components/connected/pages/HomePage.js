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
import { sortMethods } from "../../../config/constants";

import ReactGA from "react-ga";

class HomePage extends Component {
  state = {
    sort: sortMethods.CASESPER100K,
    sortDirection: "desc",
    sortHotSpots: sortMethods.CASESRATEMOVINGAVG,
    sortDirectionHotSpots: "desc",
    sortedData: [],
    sortedByDate: [],
    totals: []
  }

  componentDidMount() {
    dbg.log("Mounting Home page");
    const { getStatesSorted, getTotals, getSnapshot } = this.props;
    const { sort, sortDirection, sortHotSpots, sortDirectionHotSpots } = this.state;

    getTotals().then(totalsResult => {
      dbg.log("Got the totals", totalsResult);
      this.setState({ totals: this.formatTotals(totalsResult) }, () => {
        getSnapshot(sortHotSpots, sortDirectionHotSpots).then(countiesResult => {
          this.setState({ sortedByDate: countiesResult }, () => {
            getStatesSorted(sort, sortDirection).then(result => {
              //dbg.log("Got the sortedStates data", result);
              this.setState({ sortedData: result });
            });
          });
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
        deathsMovingAvg: deathsMovingAvg === 0 ? .0001 : deathsMovingAvg,
        mortalityRate: (unFormattedData[k].mortalityRate * 100).toFixed(2)
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

  handleHotSpotsSortClick = (newSort, ev) => {
    ev.preventDefault();
    const { getSnapshot } = this.props;
    let { sortHotSpots, sortDirectionHotSpots } = this.state;

    if (sortHotSpots === newSort) {
      sortDirectionHotSpots = sortDirectionHotSpots === "desc" ? "asc" : "desc";
    }

    getSnapshot(newSort, sortDirectionHotSpots).then(result => {
      //dbg.log("Got the sortedStates data", result);
      this.setState({ sortHotSpots: newSort, sortDirectionHotSpots, sortedByDate: result });
    });

  };

  render() {
    const { sort, sortDirection, sortedData, totals, sortHotSpots, sortDirectionHotSpots, sortedByDate } = this.state;
    return (
      <ConnectedPage pageClass="page-home" nav={this.props.nav} >
        <div className="row">
          <div className="col-12">
            <h1>Coronavirus Stats</h1>
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" id="hotspots-tab" data-toggle="tab" href="#hotspots" role="tab" aria-controls="hotspots" aria-selected="false">Hot Spots</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">US Cases</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="states-tab" data-toggle="tab" href="#states" role="tab" aria-controls="states" aria-selected="false">By State</a>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade" id="home" role="tabpanel" aria-labelledby="home-tab">
                {totals.length > 0 ? (
                  <TotalsGraph data={totals} />
                ) : (
                    "Loading..."
                  )}
              </div>
              <div className="tab-pane fade show active" id="hotspots" role="tabpanel" aria-labelledby="hotspots-tab">
                {sortedByDate.length > 0 ? (
                  <table className="table table-striped data-table">
                    <thead className="thead-dark">
                      <tr>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NAME, ev)}>
                            <span className={(sortHotSpots === sortMethods.NAME ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>County</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.CASESRATEMOVINGAVG, ev)}>
                            <span className={(sortHotSpots === sortMethods.CASESRATEMOVINGAVG ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Moving Avg of % Change</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NEWCASESMOVINGAVG, ev)}>
                            <span className={(sortHotSpots === sortMethods.NEWCASESMOVINGAVG ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Moving Avg New Cases</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NEWCASESMOVINGAVGPER100k, ev)}>
                            <span className={(sortHotSpots === sortMethods.NEWCASESMOVINGAVGPER100k ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Moving Avg New Cases Per 100k</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NEWCASES, ev)}>
                            <span className={(sortHotSpots === sortMethods.NEWCASES ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>New Cases</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NEWCASESPER100k, ev)}>
                            <span className={(sortHotSpots === sortMethods.NEWCASESPER100k ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>New Cases Per 100k</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.CASES, ev)}>
                            <span className={(sortHotSpots === sortMethods.CASES ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Case Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.DEATHS, ev)}>
                            <span className={(sortHotSpots === sortMethods.DEATHS ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Death Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.CASESPER100K, ev)}>
                            <span className={(sortHotSpots === sortMethods.CASESPER100K ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Cases Per 100k</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.DEATHSPER100K, ev)}>
                            <span className={(sortHotSpots === sortMethods.DEATHSPER100K ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Deaths Per 100k</span>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedByDate.map(countyData => (
                        <tr key={`${countyData.county}-${countyData.state}`}>
                          <td><Link to={`/county/${countyData.state}/${countyData.county}`} className="btn btn-link">{countyData.county}, {countyData.state}</Link></td>
                          <td className="data-table-number">{countyData.currentMovingAvg ? `${(countyData.currentMovingAvg * 100).toFixed(2)}%` : "0"}</td>
                          <td className="data-table-number">{countyData.newMovingAvg ? countyData.newMovingAvg.toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.newMovingAvgPer100k ? countyData.newMovingAvgPer100k.toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.newCasesCount ? countyData.newCasesCount.toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.newCasesPer100k ? Math.round(countyData.newCasesPer100k).toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.currentCasesCount ? countyData.currentCasesCount.toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.currentDeathsCount ? countyData.currentDeathsCount.toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.casesPer100k ? Math.round(countyData.casesPer100k).toLocaleString() : "0"}</td>
                          <td className="data-table-number">{countyData.deathsPer100k ? Math.round(countyData.deathsPer100k).toLocaleString() : "0"}</td>
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
  getTotals: statsActions.getTotals,
  getSnapshot: statsActions.getSnapshot
};

export default connect(
  mapStateToProps,
  actionCreators
)(HomePage);