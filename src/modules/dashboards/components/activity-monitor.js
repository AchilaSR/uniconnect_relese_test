import React, { Component } from 'react';
import { Badge, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../../components/Loader';
import { getAgentMonitorData, getAgentMonitorDataByQueue } from '../../../actions/reports';
import Countdown from '../../../components/Countdown';
import LineStatus from '../../line-status/views/LineStatus';
import { formatTimeToSeconds } from '../../../config/util';

class ActivityMonitor extends Component {
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

    async loadData() {
        const { groups_in_monitor, queues_in_monitor, agent_queues, agent_groups } = this.props;
        if ((!agent_queues && !(queues_in_monitor && queues_in_monitor.length)) || (!agent_groups && !(groups_in_monitor && groups_in_monitor.agent_groups))) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }
        const [groups, queues] = await Promise.all([new Promise((resolve, reject) => {
            if (groups_in_monitor) {
                this.props.getAgentMonitorData(groups_in_monitor.length ? groups_in_monitor : agent_groups.map(group => group.id), (err, data) => {
                    if (data) {
                        this.setState({ data: _.unionBy(data, this.state.data, 'agent_extension').filter(a => a.status_id !== 3) });
                    } else {
                        resolve([]);
                    }
                });
            } else {
                resolve([]);
            }
        }), new Promise((resolve, reject) => {
            if (queues_in_monitor) {
                this.props.getAgentMonitorDataByQueue(queues_in_monitor.length ? queues_in_monitor : agent_queues.map(queue => queue.extension), (err, data) => {
                    if (data) {
                        resolve(data)
                    } else {
                        resolve([]);
                    }
                });
            } else {
                resolve([]);
            }
        })]);

        this.setState({ data: _.unionBy(groups, queues, 'agent_extension').filter(a => a.status_id !== 5) });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data) {
            return <Loader />;
        }

        const getClassByStatus = (cellContent) => {
            if (cellContent) {
                const status = _.find(this.props.agent_activities, (s) => {
                    return s.status_name.toLowerCase() === cellContent.toLowerCase()
                });
                if (status) {
                    return `col-status bg-${status.color_desc}`;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }

        return <div>
            <Table size="sm" bordered className="mb-0">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th>Extension</th>
                        <th>Agent</th>
                        <th>Phone Status</th>
                        <th>Current Status</th>
                        <th>Duration</th>
                        <th>Queue Status</th>
                        <th>Queue Login Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.sort((a, b) => {
                        a.call_status = _.find(this.props.line_status || [], { extension: a.agent_extension });
                        b.call_status = _.find(this.props.line_status || [], { extension: b.agent_extension });

                        const getSortOder = (agent) => {
                            let priority = ["oncall", "ringing", "dialing"].indexOf((agent.call_status || {}).status);

                            if (priority === -1) {
                                priority = [1, 2, 5, 4, 0, 3].indexOf(agent.status_id) + 5;
                            }

                            if (priority === -1) {
                                priority = 100;
                            }

                            return priority
                        }

                        return getSortOder(a) - getSortOder(b);
                    }).map((row) => {
                        return (<tr key={row.agent_extension}>
                            <th>{row.agent_extension}</th>
                            <th>{row.agent_name}</th>
                            <th className='text-center'><LineStatus extension={row.agent_extension} /></th>
                            <th className={`col-status ${getClassByStatus(row.current_status_name)}`}>{row.current_status_name}{row.current_sub_status ? <small className='d-block'>{row.current_sub_status}</small> : ""}</th>
                            <th className={`col-status ${formatTimeToSeconds(row.approved_duration) > 0 && row.exceeded_duration_sec > 0 ? "bg-danger" : ""}`}>{<Countdown time={row.ellapsed_duration_sec} />}</th>
                            <th className={`col-status ${getClassByStatus(row.queueStatus)}`}>{row.queueStatus === "t" ? <Badge  color='success'>Logged In</Badge> : <Badge  color='danger'>Logged Out</Badge>}</th>
                            <th className={`col-status ${getClassByStatus(row.queueStatus)}`}> {row.queueStatus === "t" ?<Countdown time={row.queue_login_time} /> :"00:00:00"}</th>
                        </tr>)
                    })}
                </tbody>
            </Table>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAgentMonitorData,
        getAgentMonitorDataByQueue
    }, dispatch);
}

function mapStateToProps({ agent_activities, queues, groups_3cx, line_status }) {
    return {
        agent_activities,
        agent_queues: queues,
        agent_groups: groups_3cx,
        line_status
    };
}


export default (connect(mapStateToProps, mapDispatchToProps)(ActivityMonitor));