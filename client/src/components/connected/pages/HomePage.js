import React, { Component } from "react";
import { connect } from "react-redux";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import { dbg } from "../../../utils";
import { statsActions } from "../../../redux/actions";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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
    dbg("data to be formatted", data);
    Object.keys(data.casesByDate[0]).forEach(date => {
      let row = {};
      row.name = moment(date, "YYYYMMDD").format("MMM-DD");
      row.cases = parseInt(data.casesByDate[0][date]);
      row.deaths = parseInt(data.deathsByDate[0][date]);

      reformattedData.push(row);
    });

    return reformattedData;
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
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                      data={this.state.data}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis type="number" domain={['dataMin', 'dataMax']} interval={"preserveStartEnd"} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cases" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="deaths" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : ""}

            </form>
          </div>
        </div>
      </ConnectedPage>
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