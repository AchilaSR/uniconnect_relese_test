import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../../../components/Loader';
import { getLineStatus } from '../../../../modules/line-status/action';

class StatusSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.agent_monitor_data) !== JSON.stringify(prevProps.agent_monitor_data)) {
            this.props.agent_activities.forEach(async (a) => {
                const state = await this.checkSubstatusCounts(a);
                this.setState({ [a.status_name]: state });
            });
        }
    }

    async checkSubstatusCounts(a) {
        let data = this.props.agent_monitor_data;
        if (this.props.data) {
            data = this.props.data;
        }
        const agents = _.filter(data, { current_status_name: a.status_name });
        if (a.status_name === "Available" || a.status_name === "Away") {
            for (let i = 0; i < agents.length; i++) {
                const a = agents[i];
                await new Promise((resolve) => {
                    this.props.getLineStatus(a.agent_extension, () => {
                        resolve();
                    })
                })
            }
            const substatus_counts = _.groupBy(agents, (a) => {
                if (a.line_status) {
                    if (a.line_status.direction === "inbound" || a.line_status.status === "ringing") {
                        return "inbound"
                    }

                    if (a.line_status.direction === "outbound" || a.line_status.status === "dialing") {
                        return "outbound"
                    }
                }
                return "idle";
            });
            return {
                count: agents.length, substatus_counts: [
                    { status: "idle", count: substatus_counts.idle ? substatus_counts.idle.length : 0 },
                    { status: "inbound", count: substatus_counts.inbound ? substatus_counts.inbound.length : 0 },
                    { status: "outbound", count: substatus_counts.outbound ? substatus_counts.outbound.length : 0 }
                ]
            };
        } else {
            const substatus_counts = _.groupBy(agents, (a) => {
                if (a.current_sub_status)
                    return a.current_sub_status;
                else
                    return ""
            });
            return { count: agents.length, substatus_counts: a.sub_status_list ? a.sub_status_list.map((b) => ({ status: b.sub_status_name, count: substatus_counts[b.sub_status_name] ? substatus_counts[b.sub_status_name].length : 0 })) : [] };
        }
    }

    renderStatuses(a) {
        if(!this.state[a.status_name]){
            return <h1><i className='fa fa-circle-o-notch fa-spin'></i></h1>
        }

        const { count, substatus_counts } = this.state[a.status_name];

        if (substatus_counts.length > 0) {
            return <div className='status-summary sub'>
                {substatus_counts.map((b, index) =>
                    <div key={index} className='item'>
                        <div className='block'>
                            <small className='text-capitalize ellipsis'>{b.status}</small>
                            <div className='count small'>{b.count}</div>
                        </div>
                    </div>
                )}
                <div className='item'>
                    <div className='block'>
                        <small>Total</small>
                        <div className='count'>{count}</div>
                    </div>
                </div>
            </div>
        }
        return <div className='count'>{count}</div>
    }

    render() {
        const { agent_activities } = this.props;

        if (!agent_activities) {
            return <Loader />
        }

        return (
            <div className='status-summary'>
                {agent_activities.map((a, index) =>
                    <div key={index} className='item'>
                        <div className={`block bg-${a.color_desc}`}>
                            <div className='status-name'>{a.status_name}</div>
                            {this.renderStatuses(a)}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps({ agent_activities, agent_monitor_data }) {
    return {
        agent_activities, agent_monitor_data
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getLineStatus
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(StatusSummary));