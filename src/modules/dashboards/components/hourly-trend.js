import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadTrend } from '../action';
import Loader from '../../../components/Loader';
import StatCell from './stat-table-cell';
import { formatMSecondsToTime, getReportData } from '../../../config/util';
import moment from 'moment';
import { loadAgents } from '../../../actions/reports';

class HourlyTrend extends Component {
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

    componentDidMount() {
        if (!this.props.agents || !this.props.agents.length) {
            this.props.loadAgents();
        }
    }

    loadData() {
        const { queues_in_monitor = [], groups_in_monitor = [], ivrs_in_monitor = [], distribution = "hourly", max_extensions = 10, date_range, queues, agent_groups } = this.props;
        if ((!queues && !queues_in_monitor.length) || (!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }

        let agent_extension = [];

        if (queues_in_monitor.length && queues) {
            agent_extension = [...agent_extension, ...queues.filter((q) => queues_in_monitor.indexOf(q.extension) > -1).map((q) => q.extensions).flat(1)]
            // console.log("queues", agent_extension);
        }

        if (groups_in_monitor.length && agent_groups) {
            agent_extension = [...agent_extension, ...agent_groups.filter((q) => groups_in_monitor.indexOf(q.id.toString()) > -1).map((q) => (q.extensions)).flat(1)];
            // console.log("groups", agent_extension);
        }

        // { 
        //     "queues_in_monitor": queues_in_monitor.length ? queues_in_monitor : queues.map(queue => queue.extension), 
        //     "groups_in_monitor": groups_in_monitor.length ? groups_in_monitor : agent_groups.map(group => group.group), 
        //     ivrs_in_monitor, 
        //     distribution, 
        //     max_extensions, 
        //     date_range }
        this.props.loadTrend({
            "agent_extension": agent_extension.length ? agent_extension.join(" ") : null,
            "start_time": moment(process.env.REACT_APP_DASHBOARD_DATE).startOf(distribution.substr(0, 1) || "d").format("YYYY-MM-DD HH:mm:ss"),
            "end_time": moment(process.env.REACT_APP_DASHBOARD_DATE).endOf(distribution.substr(0, 1) || "d").format("YYYY-MM-DD HH:mm:ss"),
            "time_scale": distribution.substr(0, 1)
        }, (err, data) => {
            this.setState({ data });
            this.props.onStateChange(getReportData(this.state.data));

        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data || !this.props.agents) {
            return <Loader />;
        }

        if (!this.state.data.length) {
            return <div>No records available</div>;
        }

        return <div>
            <div><Table size="sm" bordered className="mb-0">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th rowSpan="2">Extension</th>
                        <th rowSpan="2">Agent</th>
                        <th colSpan="4">Inbound</th>
                        <th colSpan="4">Outbound</th>
                    </tr>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th style={{ width: 90 }}>Total</th>
                        <th style={{ width: 90 }}>Answered</th>
                        <th style={{ width: 90 }}>Unanswered</th>
                        <th style={{ width: 90 }}>Average Talk Time</th>
                        <th style={{ width: 90 }}>Total</th>
                        <th style={{ width: 90 }}>Answered</th>
                        <th style={{ width: 90 }}>Unanswered</th>
                        <th style={{ width: 90 }}>Average Talk Time</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.map((data, r) => {
                        return (<tr key={r}>
                            <th>{data.extension}</th>
                            <th>{(_.find(this.props.agents, { AgentExtension: data.extension }) || {}).AgentName}</th>
                            <StatCell value={data.inbound_calls} />
                            <StatCell value={data.inbound_calls_answered} />
                            <StatCell value={data.inbound_calls - data.inbound_calls_answered} />
                            <StatCell inverseArrowColors={true} value={formatMSecondsToTime(data.inbound_calls_talk_time / data.inbound_calls_answered * 1000)} format={false} />
                            <StatCell value={data.outbound_calls} />
                            <StatCell value={data.outbound_calls_answered} />
                            <StatCell value={data.outbound_calls - data.outbound_calls_answered} />
                            <StatCell inverseArrowColors={true} value={formatMSecondsToTime(data.outbound_calls_talk_time / data.outbound_calls_answered * 1000)} format={false} />
                        </tr>)
                    })}
                </tbody>
            </Table></div>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadTrend,
        loadAgents
    }, dispatch);
}

function mapStateToProps({ queues, groups_3cx, agents }) {
    return {
        queues, agent_groups: groups_3cx,
        agents
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(HourlyTrend));

