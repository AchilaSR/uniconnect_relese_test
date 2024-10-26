import React, { Component } from 'react';
import { Badge, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../../components/Loader';
import { getAgentMonitorData, getAgentMonitorDataByQueue } from '../../../actions/reports';
import LineStatus from '../../../modules/line-status/views/LineStatus';
import { loadLoginStats } from '../../../modules/dashboards/action';
import moment from 'moment';
import { CAMPAIGN_REFRESH_INTERVAL } from '../../../config/globals';
import StatCell from '../../../modules/dashboards/components/stat-table-cell';

class AgentsInCampaign extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {};
    }

    componentWillMount() {
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, CAMPAIGN_REFRESH_INTERVAL * 1000);
    }

    async loadData() {
        const { queue } = this.props;
        if (queue) {
            const [presence_status, queue_status] = await Promise.all([
                new Promise((resolve, reject) => {
                    this.props.getAgentMonitorDataByQueue([queue], (err, data) => {
                        resolve(data);
                    })
                }),

                new Promise((resolve, reject) => {
                    this.props.loadLoginStats({
                        queues: queue,
                        start_time: moment(process.env.REACT_APP_DASHBOARD_DATE).startOf('d').format("YYYY-MM-DD HH:mm:ss"),
                        end_time: moment(process.env.REACT_APP_DASHBOARD_DATE).endOf('d').format("YYYY-MM-DD HH:mm:ss")
                    }, (err, data) => {
                        resolve(data);
                    })
                })
            ]);

            if (presence_status) {
                this.setState({
                    data: presence_status.map((a) => {
                        return { ...a, queue_status: _.find(queue_status.queueLogin, { agent: a.agent_extension }) }
                    })
                }, this.props.onStatusChanged(this.state.data));
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    renderQueueLogin(row) {
        if (row) {
            return <td className='text-center'>{row.status === "Logged In" ? <Badge color='success'>Logged In</Badge> : <Badge color='danger'>Logged Out</Badge>}</td>
        } else {
            return <td>Loading</td>
        }
    }

    getCallCounts(extension) {
        const calls = _.filter(this.props.leads, { extension })
        return calls.length;
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
            <Table responsive size="sm" bordered className="mb-0">
                <tr style={{ verticalAlign: "middle" }}>
                    <th>Agent</th>
                    <th>Status</th>
                    <th style={{ width: 120 }}>Phone</th>
                    <th>Queue</th>
                    <th>Calls</th>
                </tr>
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
                        <td><div className='ellipsis'>[{row.agent_extension}] {row.agent_name}</div></td>
                        <td className={`col-status ${getClassByStatus(row.current_status_name)}`}>{row.current_status_name}{row.current_sub_status ? <small className='d-block'>{row.current_sub_status}</small> : ""}</td>
                        <td className='text-center p-0'><LineStatus extension={row.agent_extension} /></td>
                        {this.renderQueueLogin(row.queue_status)}
                        <StatCell value={this.getCallCounts(row.agent_extension)} />
                    </tr>)
                })}
            </Table>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAgentMonitorData,
        getAgentMonitorDataByQueue,
        loadLoginStats
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


export default (connect(mapStateToProps, mapDispatchToProps)(AgentsInCampaign));