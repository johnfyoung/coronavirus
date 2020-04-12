import React, { Component } from "react";
import { connect } from "react-redux";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import DataGraph from "../../presentation/parts/DataGraph";
import { dbg } from "../../../utils";
import { statsActions } from "../../../redux/actions";

class HomePage extends Component {
  state = {
    states: [],
    counties: [],
    selectedState: "",
    selectedCounty: "",
    data: null,
    dataMax: 0
  }

  componentDidMount() {
    dbg.log("Mounting Home page");
    const { geoloc, currentState, currentCounty, selectState, selectCounty, getStates, getCounties } = this.props;

    getStates().then(statesList => {

      if (currentState) {
        dbg.log("Mounting HomePage::have a currentState");
        getCounties(currentState).then(countiesData => {

          this.props.getCasesByCounty(currentState, currentCounty).then(data => {

            const newState = { states: statesList, counties: countiesData };
            if (data.length > 0) {
              this.setState({ ...newState, data: data[0] })
            } else {
              this.setState(newState);
            }
          });

        });

      } else {
        this.setState({ states: statesList });
      }
    });
  }

  componentDidUpdate(prevProps) {
    dbg.log("Updating Home page");
    const { geoloc, selectState, selectCounty, getCounties, currentState, currentCounty } = this.props;

    let countyName = currentCounty;
    let stateName = currentState;

    if (geoloc !== prevProps.geoloc) {
      dbg.log("HomePage::Updating geoloc");
      selectState(geoloc.address.state);
      stateName = geoloc.address.state;

      selectCounty(geoloc.address.county);
      countyName = geoloc.address.county;
    }

    if (countyName !== prevProps.currentCounty || stateName !== prevProps.currentState) {
      dbg.log("HomePage::Updating county or statename");
      if (stateName) {
        getCounties(stateName).then(countiesData => {

          if (countyName) {
            this.props.getCasesByCounty(stateName, countyName).then(data => {

              const newState = { counties: countiesData, selectedState: geoloc.address.state, selectedCounty: geoloc.address.county };
              if (data.length > 0) {
                this.setState({ ...newState, data: data[0] })
              } else {
                this.setState(newState);
              }
            });
          } else {
            this.setState({ selectedCounty: countyName });
          }
        });
      } else {
        this.setState({ selectedState: stateName });
      }
    }
  }

  handleSelectState = (ev) => {
    const stateName = ev.target.value;
    this.props.selectState(stateName);
    if (stateName) {
      this.setState({ selectedState: stateName }, () => {
        this.retrieveCounties(stateName);
      })
    }
  }

  handleSelectCounty = (ev) => {
    const { currentState } = this.props.stats;

    this.props.selectCounty(ev.target.value);

    if (ev.target.value) {
      const county = ev.target.value;
      this.setState({ selectedCounty: county }, () => {
        this.props.getCasesByCounty(currentState, county).then(data => {
          if (data.length > 0) {
            this.setState({ data: data[0] })
          }
        });
      })
    }
  }

  retrieveStates = () => {
    return this.props.getStates().then(statesData => {
      return this.setState({ states: statesData });
    });
  }

  retrieveCounties = (stateName) => {
    return this.props.getCounties(stateName).then(countiesData => {
      return this.setState({ counties: countiesData });
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
                <select className="form-control" id="selectState" onChange={this.handleSelectState} value={currentState}>
                  <option value="">Select a state...</option>
                  {this.state.states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {currentState ? (
                <div className="form-group">
                  <label htmlFor="selectCounty">Choose a county</label>
                  <select className="form-control" id="selectCounty" onChange={this.handleSelectCounty} value={currentCounty}>
                    <option value="">Select a county...</option>
                    {this.state.counties.map(c => <option key={c._id} value={c.county}>{c.county}</option>)}
                  </select>
                </div>
              ) : ""}
              {currentCounty && this.state.data ? (
                <DataGraph data={this.state.data} />
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
  stats,
  geoloc: service.geoloc,
  currentCounty: stats.currentCounty,
  currentState: stats.currentState,
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