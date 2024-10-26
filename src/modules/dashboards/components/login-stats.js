import React, { Component } from 'react';
import { Row, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadLoginStats } from '../action';
import Loader from '../../../components/Loader';
import StatBox from './stat-box';
import Countdown from '../../../components/Countdown';
import { formatTimeToSeconds, removeMilliseconds } from '../../../config/util';
import moment from 'moment';

class LoginStats extends Component {
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
        const { queues_in_monitor = [], groups_in_monitor = [], ivrs_in_monitor = [], distribution = "hourly", max_extensions = 10, date_range, queues, agent_groups } = this.props;
        if ((!queues && !queues_in_monitor.length) || (!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }

        this.props.loadLoginStats(
            {
                queues: queues_in_monitor.length ? queues_in_monitor.join(" ") : queues.map(queue => queue.extension).join(" "),
                start_time: moment(process.env.REACT_APP_DASHBOARD_DATE).startOf('d').format("YYYY-MM-DD HH:mm:ss"),
                end_time: moment(process.env.REACT_APP_DASHBOARD_DATE).endOf('d').format("YYYY-MM-DD HH:mm:ss")
            }, (err, data) => {
                this.setState({ data });
            });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data) {
            return <Loader />;
        }

        let size = 3;

        switch (this.props.position.w) {
            case 1:
                size = 12;
                break;
            case 4:
                size = 2;
                break;
        }

        return <div>
            <Row className="px-3">
                <StatBox size={size} value={_.filter(this.state.data.queueLogin, { status: "Logged In" }).length} label="Total Logged In Agents" />
                <StatBox size={size} value={_.filter(this.state.data.queueLogin, { status: "Logged Out" }).length} label="Total Logged Out Agents" />
                {this.state.data.highest_answered_agent_name ?
                    <StatBox size={Math.min(size * 2, 12)} showArrow={false} format={false} value={`${this.state.data.highest_answered_count} calls answered by ${this.state.data.highest_answered_agent_name}`} label="Highest Calls Answered By" /> :
                    <StatBox size={Math.min(size * 2, 12)} showArrow={false} format={false} value={"No calls received"} label="Highest Calls Answered By" />}

            </Row>
            <Table size="sm" bordered className="mb-0">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th>Extension</th>
                        <th>Agent</th>
                        <th>Queue</th>
                        <th>Queue Status</th>
                        <th>Total Logged In Time</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.queueLogin.sort((a, b) => ((b.status === "Logged In") - (a.status ===  "Logged In"))).map((data, r) => {
                        return (<tr key={r}>
                            <th>{data.agent}</th>
                            <th>{data.agent_name}</th>
                            <th>{data.queue_name}</th>
                            <th className={data.status === "Logged In" ? "bg-success" : "bg-danger"}>{data.status} </th>
                            <th>{data.status === "Logged In" ? <Countdown time={formatTimeToSeconds(removeMilliseconds(data.logged_in_time))} /> : removeMilliseconds(data.logged_in_time)} </th>
                        </tr>)
                    })}
                </tbody>
            </Table>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadLoginStats,
    }, dispatch);
}

function mapStateToProps({ queues, groups_3cx }) {
    return {
        queues, agent_groups: groups_3cx
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(LoginStats));