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
            row.newCases = parseInt(data.casesByDate[0][date]["new"]);
            row.newMovingAvg = parseInt(data.casesByDate[0][date]["newMovingAvg"]);
            row.casesRate = data.casesByDate[0][date]["rate"] && !Number.isNaN(data.casesByDate[0][date]["rate"]) && data.casesByDate[0][date]["rate"] >= 0 ? parseFloat(data.casesByDate[0][date]["rate"]) : .0001;
            row.casesHarm = data.casesByDate[0][date]["harm"] && !Number.isNaN(data.casesByDate[0][date]["harm"]) && data.casesByDate[0][date]["harm"] >= 0 ? parseFloat(data.casesByDate[0][date]["harm"]) : .0001;
            row.casesSMA = data.casesByDate[0][date]["sma"] && !Number.isNaN(data.casesByDate[0][date]["sma"]) && data.casesByDate[0][date]["sma"] >= 0 ? parseFloat(data.casesByDate[0][date]["sma"]) : 0;
            row.casesMov = data.casesByDate[0][date]["movingAvg"] && !Number.isNaN(data.casesByDate[0][date]["movingAvg"]) && data.casesByDate[0][date]["movingAvg"] >= 0 ? parseFloat(data.casesByDate[0][date]["movingAvg"]) : .0001;

            row.deathsCount = parseInt(data.deathsByDate[0][date]["count"]);
            row.mortalityRate = row.deathsCount > 0 && row.casesCount > 0 ? ((row.deathsCount / row.casesCount) * 100).toFixed(2) : .0001
            row.deathsHarm = data.deathsByDate[0][date]["harm"] && !Number.isNaN(data.deathsByDate[0][date]["harm"]) && data.deathsByDate[0][date]["harm"] >= 0 ? parseFloat(data.deathsByDate[0][date]["harm"]) : .0001;

            reformattedData.push(row);
        });

        return reformattedData;
    };

    render() {
        dbg.log("DataGraph data", this.props.data);
        const formattedData = this.props.data ? this.formatData(this.props.data) : null;

        return (
            <div>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={formattedData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis type="number" yAxisId="left" orientation="left" scale="log" domain={[1, 'dataMax']} allowDataOverflow={true} />
                        <YAxis type="number" yAxisId="right" orientation="right" scale="log" domain={[1, 20]} allowDataOverflow={true} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" yAxisId="left" dataKey="casesCount" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
                        <Line type="monotone" yAxisId="left" dataKey="deathsCount" stroke="#82ca9d" dot={false} />
                        <Line type="monotone" yAxisId="left" dataKey="newCases" stroke="#dddddd" dot={false} />
                        <Line type="monotone" yAxisId="left" dataKey="newMovingAvg" stroke="#00dddd" dot={false} activeDot={{ r: 8 }} />
                        <Line type="monotone" yAxisId="right" dataKey="mortalityRate" stroke="#FF0000" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }
}
