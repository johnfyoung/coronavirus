import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import TotalsPage from "../../presentation/parts/TotalsGraph";
import { dbg, history } from "../../../utils";
import { statsActions } from "../../../redux/actions";

class GraphPage extends Component {
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
        return Object.keys(unFormattedData).map(k => ({
            name: moment(k, "YYYYMMDD").format("MMM-DD"),
            ...unFormattedData[k]
        }));
    }

    render() {
        const { match } = this.props;
        return (
            <ConnectedPage pageClass="page-state" nav={this.props.nav} >
                <div className="row">
                    <div className="col-12">
                        {match && match.params ? (
                            <div>
                                <h1>Stats for {match.params.state.charAt(0).toUpperCase() + match.params.state.slice(1)}</h1>
                                {this.state.stateTotals.length > 0 ? (
                                    <TotalsPage data={this.state.stateTotals} />
                                ) : ""}
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
)(GraphPage);