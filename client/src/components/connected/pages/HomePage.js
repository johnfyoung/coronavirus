import React, { Component } from "react";
import { connect } from "react-redux";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import { dbg } from "../../../utils";
import { statsActions } from "../../../redux/actions";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

import moment from "moment";

class HomePage extends Component {
  state = {
    states: [],
    counties: [],
    data: [],
    dataMax: 0
  }

  componentDidMount() {
    this.props.getStates().then(data => {
      this.setState({ states: data });
    });
  }

  handleSelectState = (ev) => {
    this.props.selectState(ev.target.value);
    if (ev.target.value) {
      this.props.getCounties(ev.target.value).then(data => {
        this.setState({ counties: data });
      });
    }
  }

  handleSelectCounty = (ev) => {
    const { currentState } = this.props.stats;

    this.props.selectCounty(ev.target.value);
    this.props.getCasesByCounty(currentState, ev.target.value).then(data => {
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

  handleMouseOver = (target) => {
    //dbg.log("Mouse Over Ev", ev);
    target.stroke = "#885687";
  };

  render() {
    const { currentCounty, currentState } = this.props.stats;
    return (
      <ConnectedPage pageClass="page-home" nav={this.props.nav} >
        <div className="row">
          <div className="col-12">
            <h1>Coronavirus Stats</h1>
            <div>Just trying to get stats all in one place</div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h2>By county</h2>
            <form>
              <div className="form-group">
                <label htmlFor="selectState">Choose a state</label>
                <select className="form-control" id="selectState" onChange={this.handleSelectState}>
                  <option value="">Select a state...</option>
                  {this.state.states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {currentState ? (
                <div className="form-group">
                  <label htmlFor="selectCounty">Choose a county</label>
                  <select className="form-control" id="selectCounty" onChange={this.handleSelectCounty}>
                    <option value="">Select a county...</option>
                    {this.state.counties.map(c => <option key={c._id} value={c.county}>{c.county}</option>)}
                  </select>
                </div>
              ) : ""}
              {currentCounty ? (
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
                      <YAxis type="number" yAxisId="left" orientation="left" domain={[0, .5]} allowDataOverflow={true} />
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
                  <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
                </div>
              ) : ""}

            </form>
          </div>
        </div>
      </ConnectedPage >
    );
  }

}

const mapStateToProps = ({ service, loading, stats }) => ({
  service,
  loading,
  stats
});

const actionCreators = {
  getStates: statsActions.getStates,
  getCounties: statsActions.getCounties,
  selectState: statsActions.selectState,
  selectCounty: statsActions.selectCounty,
  getCasesByCounty: statsActions.getCasesByCounty
};

export default connect(
  mapStateToProps,
  actionCreators
)(HomePage);