import React, { Component } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";

import ConnectedPage from "../../connected/templates/ConnectedPage";
import DataGraph from "../../presentation/parts/DataGraph";
import { dbg, history } from "../../../utils";
import { statsActions } from "../../../redux/actions";

class GraphPage extends Component {
    state = {
        data: null,
        dataMax: 0
    }

    componentDidMount() {
        this.props.getCasesByCounty(this.props.match.params.state, this.props.match.params.county).then(data => {
            if (data.length > 0) {
                this.setState({ data: data[0] })
            }
        });
    }

    render() {
        const { match } = this.props;
        return (
            <ConnectedPage pageClass="page-graph" nav={this.props.nav} >
                <div className="row">
                    <div className="col-12">
                        {match && match.params ? (
                            <div>
                                <h1>Stats for {match.params.county.charAt(0).toUpperCase() + match.params.county.slice(1)} County ({match.params.state.charAt(0).toUpperCase() + match.params.state.slice(1)} State)</h1>
                                {this.state.data ? <DataGraph data={this.state.data} /> : ""}
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
    getCasesByCounty: statsActions.getCasesByCounty
};

export default connect(
    mapStateToProps,
    actionCreators
)(GraphPage);