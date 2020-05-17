import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";


import ConnectedPage from "../../connected/templates/ConnectedPage";
import DataGraph from "../../presentation/parts/DataGraph";
import { dbg, history } from "../../../utils";
import { statsActions } from "../../../redux/actions";

const Parser = require('rss-parser');

class GraphPage extends Component {
    state = {
        data: null,
        news: [],
        dataMax: 0
    }

    componentDidMount() {
        const rssParser = new Parser();
        const { county, state } = this.props.match.params;

        const newsURL = `https://cors-anywhere.herokuapp.com/https://news.google.com/rss/search?q=${county}+county+${state}+coronavirus&hl=en-US&gl=US&ceid=US:en`;

        this.props.getCasesByCounty(state, county).then(data => {
            if (data.length > 0) {
                this.setState({ data: data[0] }, async () => {
                    const newsResult = await rssParser.parseURL(newsURL);

                    dbg.log("News result", newsResult);
                    this.setState({ news: newsResult.items });
                })
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
                            <Fragment>
                                <h1>Stats for {match.params.county.charAt(0).toUpperCase() + match.params.county.slice(1)} County ({match.params.state.charAt(0).toUpperCase() + match.params.state.slice(1)} State)</h1>
                                <ul class="nav nav-tabs" id="myTab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="data-tab" data-toggle="tab" href="#data" role="tab" aria-controls="data" aria-selected="true">Data</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="news-tab" data-toggle="tab" href="#news" role="tab" aria-controls="news" aria-selected="false">News</a>
                                    </li>
                                </ul>
                                <div class="tab-content" id="myTabContent">
                                    <div class="tab-pane fade show active" id="data" role="tabpanel" aria-labelledby="data-tab">
                                        <div>
                                            {this.state.data ? <DataGraph data={this.state.data} /> : ""}
                                        </div>
                                    </div>
                                    <div class="tab-pane fade show" id="news" role="tabpanel" aria-labelledby="news-tab">
                                        {this.state.news ? (
                                            <div>
                                                <ul>
                                                    {this.state.news.map((newsItem, i) => (
                                                        <li key={i}><a href={newsItem.link} target="_blank">{newsItem.title} ({newsItem.pubDate})</a> </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                                <div>No news!</div>
                                            )}
                                    </div>
                                </div>
                            </Fragment>

                        ) : (
                                <p>Broken!</p>
                            )}
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