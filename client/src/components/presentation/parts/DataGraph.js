import React, { Component } from "react";
import { dbg } from "../../../utils";
import moment from "moment";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

export default class DataGraph extends Component {
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
        dbg.log("DataGraph data", this.props.data);
        const formattedData = this.props.data ? this.formatData(this.props.data) : null;

        return (
            <div>
                <h2>Cases count</h2>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={formattedData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis type="number" yAxisId="left" orientation="left" domain={['dataMin', 'dataMax']} interval={"preserveStartEnd"} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" yAxisId="left" dataKey="casesCount" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
                        <Line type="monotone" yAxisId="left" dataKey="deathsCount" stroke="#82ca9d" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                <h2>Cases rate of change</h2>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={formattedData}
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
                        <Line type="monotone" yAxisId="left" dataKey="casesRate" stroke="#cccccc" dot={false} activeDot={{ r: 8 }} />
                        <Line type="monotone" yAxisId="left" dataKey="casesMov" stroke="#c4355d" dot={false} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }
}
