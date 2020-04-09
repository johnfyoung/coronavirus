import React, { Component } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import { dbg, history } from "../../../utils";
import { statsActions } from "../../../redux/actions";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

import moment from "moment";

class GraphPage extends Component {
    state = {
        data: [],
        dataMax: 0
    }

    componentDidMount() {

        this.props.getCasesByCounty(this.props.match.params.state, this.props.match.params.county).then(data => {
            if (data.length > 0) {
                this.setState({ data: this.formatData(data[0]) })
            }
        });
    }

    formatData = (data) => {
        const reformattedData = [];
        dbg.log("data to be formatted", data);
        Object.keys(data.casesByDate[0]).forEach(date => {
            let row = {};
            row.name = moment(date, "YYYYMMDD").format("MMM-DD");
            row.casesCount = parseInt(data.casesByDate[0][date]["count"]);
            row.casesRate = data.casesByDate[0][date]["rate"] && !Number.isNaN(data.casesByDate[0][date]["rate"]) && data.casesByDate[0][date]["rate"] >= 0 ? parseFloat(data.casesByDate[0][date]["rate"]) : 0;
            row.casesHarm = data.casesByDate[0][date]["harm"] && !Number.isNaN(data.casesByDate[0][date]["harm"]) && data.casesByDate[0][date]["harm"] >= 0 ? parseFloat(data.casesByDate[0][date]["harm"]) : 0;
            row.casesSMA = data.casesByDate[0][date]["sma"] && !Number.isNaN(data.casesByDate[0][date]["sma"]) && data.casesByDate[0][date]["sma"] >= 0 ? parseFloat(data.casesByDate[0][date]["sma"]) : 0;
            row.casesMov = data.casesByDate[0][date]["movingAvg"] && !Number.isNaN(data.casesByDate[0][date]["movingAvg"]) && data.casesByDate[0][date]["movingAvg"] >= 0 ? parseFloat(data.casesByDate[0][date]["movingAvg"]) : 0;

            row.deathsCount = parseInt(data.deathsByDate[0][date]["count"]);
            row.deathsRate = data.deathsByDate[0][date]["rate"] && !Number.isNaN(data.deathsByDate[0][date]["rate"]) && data.deathsByDate[0][date]["rate"] >= 0 ? parseFloat(data.deathsByDate[0][date]["rate"]) : 0;
            row.deathsHarm = data.deathsByDate[0][date]["harm"] && !Number.isNaN(data.deathsByDate[0][date]["harm"]) && data.deathsByDate[0][date]["harm"] >= 0 ? parseFloat(data.deathsByDate[0][date]["harm"]) : 0;

            reformattedData.push(row);
        });

        return reformattedData;
    };

    render() {
        const { match } = this.props;
        return (
            <ConnectedPage pageClass="page-graph" nav={this.props.nav} >
                <div className="row">
                    <div className="col-12">
                        <h1>Stats for {match.params.county.charAt(0).toUpperCase() + match.params.county.slice(1)} County ({match.params.state.charAt(0).toUpperCase() + match.params.state.slice(1)} State)</h1>
                        <div>
                            <h2>Cases rate of change</h2>
                            <ResponsiveContainer width="100%" height={500}>
                                <LineChart
                                    data={this.state.data}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis type="number" yAxisId="left" orientation="left" domain={[0, 1]} allowDataOverflow={true} />
                                    <Tooltip />
                                    <Legend />
                                    <Brush />
                                    <Line type="monotone" yAxisId="left" dataKey="casesHarm" stroke="#4db84d" activeDot={{ r: 8 }} />
                                    <Line type="monotone" yAxisId="left" dataKey="casesRate" stroke="#3546c4" activeDot={{ r: 8 }} />
                                    <Line type="monotone" yAxisId="left" dataKey="casesMov" stroke="#c4355d" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>

                            <h2>Cases count</h2>
                            <ResponsiveContainer width="100%" height={500}>
                                <LineChart
                                    data={this.state.data}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis type="number" yAxisId="left" orientation="left" domain={['dataMin', 'dataMax']} interval={"preserveStartEnd"} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" yAxisId="left" dataKey="casesCount" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    <Line type="monotone" yAxisId="left" dataKey="deathsCount" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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
    getCasesByCounty: statsActions.getCasesByCounty
};

export default connect(
    mapStateToProps,
    actionCreators
)(GraphPage);