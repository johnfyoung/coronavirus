import React, { Component } from "react";
import { connect } from "react-redux";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import { dbg } from "../../../utils";
import { statsActions } from "../../../redux/actions";

class HomePage extends Component {
  state = {
    states: [],
    counties: [],
    cases: {}
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
        this.setState({ cases: data[0] })
      }
    });
  }

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
                  Got a county: {currentCounty}
                  <pre>{JSON.stringify(this.state.cases, null, 2)}</pre>
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