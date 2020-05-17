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
    const { getStatesSorted, getTotals, getByDate } = this.props;
    const { sort, sortDirection, sortHotSpots, sortDirectionHotSpots } = this.state;

    getTotals().then(totalsResult => {
      dbg.log("Got the totals", totalsResult);
      this.setState({ totals: this.formatTotals(totalsResult) }, () => {
        getByDate(sortHotSpots, sortDirectionHotSpots).then(countiesResult => {
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

  handleHotSpotsSortClick = (newSort, ev) => {
    ev.preventDefault();
    const { getByDate } = this.props;
    let { sortHotSpots, sortDirectionHotspots } = this.state;

    if (sortHotSpots === newSort) {
      sortDirectionHotspots = sortDirectionHotspots === "desc" ? "asc" : "desc";
    }

    getByDate(newSort, sortDirectionHotspots).then(result => {
      //dbg.log("Got the sortedStates data", result);
      this.setState({ sortHotSpots: newSort, sortDirectionHotspots, sortedByDate: result });
    });

  };

  render() {
    const { sort, sortDirection, sortedData, totals, sortHotSpots, sortDirectionHotSpots, sortedByDate } = this.state;

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
                <a class="nav-link" id="hotspots-tab" data-toggle="tab" href="#hotspots" role="tab" aria-controls="hotspots" aria-selected="false">Hot Spots</a>
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
              <div class="tab-pane fade" id="hotspots" role="tabpanel" aria-labelledby="hotspots-tab">
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
                            <span className={(sortHotSpots === sortMethods.CASESRATEMOVINGAVG ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>% Change Moving Avg</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick(sortMethods.NEWCASES, ev)}>
                            <span className={(sortHotSpots === sortMethods.NEWCASES ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>New Cases</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick("cases", ev)}>
                            <span className={(sortHotSpots === "cases" ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Case Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick("deaths", ev)}>
                            <span className={(sortHotSpots === "deaths" ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Death Count</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick("casesPer100k", ev)}>
                            <span className={(sortHotSpots === "casesPer100k" ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Cases Per 100k</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button className="btn btn-link text-light" onClick={(ev) => this.handleHotSpotsSortClick("deathsPer100k", ev)}>
                            <span className={(sortHotSpots === "deathsPer100k" ? (sortDirectionHotSpots === "desc" ? "arrow-down" : "arrow-up") : "")}>Deaths Per 100k</span>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedByDate.map(countyData => (
                        <tr key={`${countyData.county}-${countyData.state}`}>
                          <td><Link to={`/county/${countyData.state}/${countyData.county}`} className="btn btn-link">{countyData.county}, {countyData.state}</Link></td>
                          <td className="data-table-number">{countyData.currentMovingAvg ? `${(countyData.currentMovingAvg * 100).toFixed(2)}%` : "0"}</td>
                          <td className="data-table-number">{countyData.newCasesCount ? countyData.newCasesCount.toLocaleString() : "0"}</td>
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
  getByDate: statsActions.getByDate
};

export default connect(
  mapStateToProps,
  actionCreators
)(HomePage);