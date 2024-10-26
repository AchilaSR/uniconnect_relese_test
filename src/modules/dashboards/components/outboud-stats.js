import React, { Component } from 'react';
import { Row } from 'reactstrap';
import StatBox from './stat-box';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadOutboundStats } from '../action';
import { getReportData } from '../../../config/util';

class OutboundStats extends Component {
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
        const { queues_in_monitor = [], groups_in_monitor = [], ivrs_in_monitor = [], date_range ,agent_groups} = this.props;
        if ((!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }
        this.props.loadOutboundStats({ 
            queues_in_monitor,
            "groups_in_monitor": groups_in_monitor.length ? groups_in_monitor : agent_groups.map(group => group.id),  
            ivrs_in_monitor, 
            date_range }, (err, data) => {
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
                <StatBox size={size} value={this.state.total_outbound_count} label="Total Outbound Calls" />
                <StatBox size={size} value={this.state.total_outbound_answer_count} label="Total Answered" />
                <StatBox size={size} inverseArrowColors={true} value={this.state.total_outbound_unanswer_count} label="Total Unanswered" />
                <StatBox size={size} value={this.state.outbound_answer_rate} decimals={2} label="Answer Rate (%)" />
            </Row>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadOutboundStats
    }, dispatch);
}

function mapStateToProps({  groups_3cx }) {
    return {
        agent_groups: groups_3cx
    };
}


export default (connect(mapStateToProps, mapDispatchToProps)(OutboundStats));