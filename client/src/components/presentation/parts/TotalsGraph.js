import React from 'react'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

export default function TotalsGraph({ data }) {
    return (
        <div>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" yAxisId="left" orientation="left" domain={['dataMin', 'dataMax']} interval={"preserveStartEnd"} />
                    <YAxis type="number" yAxisId="right" orientation="right" domain={[0, .2]} allowDataOverflow={true} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" yAxisId="left" dataKey="cases" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
                    <Line type="monotone" yAxisId="left" dataKey="deaths" stroke="#82ca9d" dot={false} />
                    <Line type="monotone" yAxisId="right" dataKey="deathsRate" stroke="#FF0000" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
