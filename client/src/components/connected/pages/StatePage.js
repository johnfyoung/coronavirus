import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";

import { mean } from "simple-statistics";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import TotalsPage from "../../presentation/parts/TotalsGraph";
import { dbg, history } from "../../../utils";
import { statsActions } from "../../../redux/actions";

class StatePage extends Component {
    state = {
        sortedCounties: null,
        stateTotals: [],
        dataMax: 0
    }

    componentDidMount() {
        const { getCounties, getStateTotals } = this.props;
        getCounties(this.props.match.params.state).then(byCountyData => {
            dbg.log("StatePage got data", byCountyData);
            if (byCountyData && byCountyData.length > 0) {
                this.setState({ sortedCounties: byCountyData }, () => {
                    getStateTotals(this.props.match.params.state).then(stateTotals => {
                        if (stateTotals) {
                            this.setState({ stateTotals: this.formatStateTotals(stateTotals) });
                        }
                    })
                })
            }
        });
    }

    formatStateTotals(unFormattedData) {
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

    render() {
        const { match } = this.props;
        return (
            <ConnectedPage pageClass="page-state" nav={this.props.nav} >
                <div className="row">
                    <div className="col-12">
                        {match && match.params ? (
                            <Fragment>
                                <h1>Stats for {match.params.state.charAt(0).toUpperCase() + match.params.state.slice(1)}</h1>
                                <ul class="nav nav-tabs" id="myTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="totals-tab" data-toggle="tab" href="#totals" role="tab" aria-controls="totals" aria-selected="true">Totals</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="counties-tab" data-toggle="tab" href="#counties" role="tab" aria-controls="counties" aria-selected="false">By County</a>
                                    </li>
                                </ul>

                                <div class="tab-content" id="myTabContent">
                                    <div class="tab-pane fade show active" id="totals" role="tabpanel" aria-labelledby="totals-tab">
                                        {this.state.stateTotals.length > 0 ? (
                                            <TotalsPage data={this.state.stateTotals} />
                                        ) : ""}
                                    </div>
                                    <div class="tab-pane fade" id="counties" role="tabpanel" aria-labelledby="counties-tab">

                                        <div>


                                            {this.state.sortedCounties && this.state.sortedCounties.length > 0 ? (
                                                <table className="table table-striped">
                                                    <thead className="thead-dark">
                                                        <tr>
                                                            <th scope="col"><button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("name", ev)}><span>County</span></button></th>
                                                            <th scope="col"><button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("count", ev)}><span>Case Count</span><span className="arrow-down"></span></button></th>
                                                            <th scope="col"><button className="btn btn-link text-light" onClick={(ev) => this.handleSortClick("rate", ev)}><span>Growth Rate (5 day moving avg)</span></button></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.sortedCounties.map(county => (
                                                            <tr key={county.uniqueKey}>
                                                                <td><Link to={`/county/${county.state}/${county.county}`} className="btn btn-link">{county.county}</Link></td>
                                                                <td>{county.currentCasesCount}</td>
                                                                <td>{(county.currentMovingAvg * 100).toFixed(2)}%</td>
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
                            </Fragment>
                        ) : "Broken"}
                    </div>
                </div>
            </ConnectedPage>
        )
    }
}

const mapStateToProps = ({ service, loading, stats }) => ({
    service,
    loading,
    stats
});

const actionCreators = {
    getCounties: statsActions.getCountiesSorted,
    getStateTotals: statsActions.getCasesByState
};

export default connect(
    mapStateToProps,
    actionCreators
)(StatePage);