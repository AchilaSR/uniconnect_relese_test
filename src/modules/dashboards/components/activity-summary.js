import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../../components/Loader';
import { getAgentMonitorData, getAgentMonitorDataByQueue } from '../../../actions/reports';
import StatusSummary from '../../../containers/views/Reports/ActivityMonitor/StatusSummary';

class ActivitySummary extends Component {
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
        const { groups_in_monitor = [], queues_in_monitor = [], queues, agent_groups } = this.props;

        if ((!queues && !queues_in_monitor.length) || (!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }

        if (groups_in_monitor) {
            this.props.getAgentMonitorData(groups_in_monitor.length ? groups_in_monitor : agent_groups.map(group => group.id), (err, data) => {
                if (data) {
                    this.setState({ data: _.unionBy(data, this.state.data, 'agent_extension') });
                }
            });
        }

        if (queues_in_monitor) {
            this.props.getAgentMonitorDataByQueue(queues_in_monitor.length ? queues_in_monitor : queues.map(queue => queue.extension), (err, data) => {
                if (data) {
                    this.setState({ data: _.unionBy(data, this.state.data, 'agent_extension') });
                }
            });
        }
    }


    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data) {
            return <Loader />;
        }

        return <div>
            <StatusSummary data={this.state.data} />
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAgentMonitorData,
        getAgentMonitorDataByQueue
    }, dispatch);
}

function mapStateToProps({ agent_activities, queues, groups_3cx }) {
    return {
        agent_activities, queues, agent_groups: groups_3cx
    };
}


export default (connect(mapStateToProps, mapDispatchToProps)(ActivitySummary));