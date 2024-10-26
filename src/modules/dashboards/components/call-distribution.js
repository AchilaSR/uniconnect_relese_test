import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index } from '../../call-distribution/action';
import Loader from '../../../components/Loader';
import { formatCurrency, formatMSecondsToTime, removeMilliseconds } from '../../../config/util';
import StatCell from './stat-table-cell';
import { list3cxGroups } from '../../../actions/configurations';
import moment from 'moment';


class HourlyDistribution extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {
            scale: "",
            call_distribution: []
        };
    }


    componentWillMount() {
        this.props.list3cxGroups();
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.groups_3cx) {
            this.setState({
                groupExtensions: nextProps.groups_3cx,
            });
        }
    }

    loadData() {
        const { queues_in_monitor = [], groups_in_monitor = [], exclude_interval, queues, agent_groups } = this.props;

        if ((!queues && !queues_in_monitor.length) || (!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }

        this.props.loadDistribution({
            "queues_in_monitor": queues_in_monitor.length ? queues_in_monitor : null,
            "groups_in_monitor": groups_in_monitor.length ? agent_groups.filter((q) => groups_in_monitor.indexOf(q.id) > -1).map((q) => (q.extensions)).flat(1) : null,
            "filter": exclude_interval,
            "date": moment(process.env.REACT_APP_DASHBOARD_DATE).startOf('d').format("YYYY-MM-DD"),
            "time_scale": 'hour'
        }, (call_distribution) => {
            this.setState({ call_distribution })
        });
    }



    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        const { call_distribution } = this.state;

        if (!call_distribution) {
            return "Please generate the report";
        }

        if (call_distribution.length === 0) {
            return "No records found";
        }
        let scale = "";
        let start; let len;
        if (call_distribution.length === 31) {
            scale = "Date"
            start = 0
            len = 10
        }

        if (call_distribution.length === 24) {
            scale = "Hour"
            start = 11
            len = 8
        }

        if (call_distribution.length === 12) {
            scale = "Month"
            start = 0
            len = 7
        }


        if (!call_distribution) {
            return <Loader />;
        }


        return <div className='mb-3'>
            <div><Table size="sm" bordered className="mb-0">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th style={{ minWidth: 90, maxWidth: 90}} rowSpan="3">Hour</th>
                        <th colSpan="6">Inbound</th>
                        <th colSpan="3">Outbound</th>
                    </tr>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90}}>Total</th>
                        <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90}}>Answered</th>
                        <th colSpan="2">Abandoned Calls</th>
                        <th colSpan="2">Average Waiting Time</th>
                        <th rowSpan="2" style={{ minWidth: 90, maxWidth: 90}}>Total</th>
                        <th rowSpan="2" style={{ minWidth: 90, maxWidth: 90}}>Answered</th>
                        <th rowSpan="2" style={{ minWidth: 90, maxWidth: 90}}>Unanswered</th>
                    </tr><tr style={{ verticalAlign: "middle" }}>
                        <th style={{ minWidth: 90, maxWidth: 90}}>Count</th>
                        <th style={{ minWidth: 90, maxWidth: 90}}>%</th>
                        <th style={{ minWidth: 90, maxWidth: 90}}>Answered</th>
                        <th style={{ minWidth: 90, maxWidth: 90}}>Abandoned</th>
                    </tr>
                </thead>
                <tbody >
                    {call_distribution.map((data, r) => {
                        return (<tr key={r}>
                            <th>{data.time_period.substr(start, len)}</th>
                            <StatCell value={data.inbound_total} />
                            <StatCell value={data.inbound_answered} />
                            <StatCell value={data.inbound_unanswered} />
                            <StatCell format={false} value={formatCurrency(data.inbound_unanswered / (data.inbound_total) * 100)} />
                            <StatCell format={false} value={removeMilliseconds(data.avg_waiting_answered)} />
                            <StatCell format={false} value={removeMilliseconds(data.avg_waiting_unanswered)} />
                            <StatCell value={data.outbound_total} />
                            <StatCell value={data.outbound_answered} />
                            <StatCell value={data.outbound_unanswered} />
                        </tr>)
                    })}
                </tbody>
            </Table></div>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadDistribution: index,
        list3cxGroups
    }, dispatch);
}

function mapStateToProps({ queues, groups_3cx }) {
    return {
        queues,
        agent_groups: groups_3cx
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(HourlyDistribution));