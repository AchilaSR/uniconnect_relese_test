import React, { Component } from 'react';
import { Row } from 'reactstrap';
import StatBox from './stat-box';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadIvrStats } from '../action';
import { getReportData } from '../../../config/util';

class IvrStats extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {};
    }

    componentWillMount() {
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    loadData() {
        const { ivrs_in_monitor = [] } = this.props;
        this.props.loadIvrStats(ivrs_in_monitor, (err, data) => {
            this.setState({ ...this.state, ...data });
            this.props.onStateChange(getReportData(this.state));
        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        let size = 3;
        if (this.props.position.w && this.props.position.w === 1) {
            size = 12
        }

        return <div>
            <Row className="px-3">
                <StatBox size={size} value={this.state.total_calls_received} label="Total Calls Received" />
                <StatBox size={size} value={this.state.total_answered_calls} label="Total Answered" />
                <StatBox size={size} value={this.state.answer_rate} decimals={2} label="Answer Rate" />
                <StatBox size={size} inverseArrowColors={true} value={this.state.total_missed_calls} label="Total Missed Calls" />
            </Row>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadIvrStats
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(IvrStats));