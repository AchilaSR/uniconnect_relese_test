import React, { Component } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from 'reactstrap';
import InboundStats from '../components/inbound-stats';
import HourlyTrend from '../components/hourly-trend';
import LoginStats from '../components/login-stats';
import OutboundStats from '../components/outboud-stats';
import { CSVLink } from 'react-csv';
import CallDistribution from '../components/call-distribution';
import ActivityMonitor from '../components/activity-monitor';
import IvrStats from '../components/ivr-stats';
import { formatMSecondsToTime } from '../../../config/util';
import { connect } from 'react-redux';
import ActivitySummary from '../components/activity-summary';
import CallDistributionChart from '../components/call-distribution-chart';
import CrmCountWidget from '../../crm/views/widgets/widget-counts';
import CrmTableWidget from '../../crm/views/widgets/widget-table';
import CrmKanbanWidget from '../../crm/views/widgets/widget-kanban';

class Widget extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showLegend: false
        }
    }

    renderWidget(widget, cb) {
        switch (widget.type) {
            case "inbound":
                return <InboundStats {...widget} onStateChange={cb} />;
            case "outbound":
                return <OutboundStats {...widget} onStateChange={cb} />;
            case "trend":
                return <HourlyTrend {...widget} onStateChange={cb} />;
            case "login-stats":
                return <LoginStats {...widget} onStateChange={cb} />;
            case "distribution":
                return <CallDistribution {...widget} onStateChange={cb} />;
            case "distribution-chart":
                return <CallDistributionChart {...widget} onStateChange={cb} />;
            case "activity-monitor":
                return <ActivityMonitor {...widget} onStateChange={cb} />;
            case "activity-summary":
                return <ActivitySummary {...widget} onStateChange={cb} />;
            case "ivr":
                return <IvrStats {...widget} onStateChange={cb} />;
            case "crm-counts":
                return <CrmCountWidget {...widget} onStateChange={cb} />;
            case "crm-table":
                return <CrmTableWidget {...widget} onStateChange={cb} />;
            case "crm-kanban":
                return <CrmKanbanWidget {...widget} onStateChange={cb} />;
        }
    }

    render() {
        const { widget, showControls, deleteWidget, queues, ivrs, agent_groups, editable } = this.props;
        const { queues_in_monitor = [], groups_in_monitor = [], ivrs_in_monitor = [], exclude_interval, module_name, sortField, search_fileds } = widget;

        return <Card className='dashboard-widget'>
            <CardHeader className="py-2">
                <div className="d-flex align-items-center">
                    {widget.title}
                    {
                        showControls ?
                            <div className="ml-auto">
                                {/*this.state.data && this.state.headers ? <CSVLink data={this.state.data} headers={this.state.headers} filename={widget.title + ".csv"}>
                                    <i className="fa fa-download" ></i>
                                </CSVLink> : ""*/}
                                <a onClick={() => this.setState({ showLegend: !this.state.showLegend })}><i className="fa fa-info" ></i></a>
                                {editable ? <a className="danger" onClick={() => deleteWidget(widget)}><i className="fa fa-close" ></i></a> : ""}
                            </div>
                            : ""}
                </div>
            </CardHeader>
            <CardBody className='pb-0 d-flex justify-content-between'>
                <div className='flex-grow-1'>
                    {this.renderWidget(widget, ({ data, headers }) => {
                        this.setState({ data, headers })
                    })}
                </div>
                {this.state.showLegend ? <div className='px-3 flex-shrink-0' style={{ width: 300, overflow: "auto" }}>
                    {queues_in_monitor && queues_in_monitor.length ? <div><h6>Queues</h6><ul>{queues_in_monitor.map(a => <li>{(_.find(queues, { extension: a }) || { display_name: "Queue " + a }).display_name}</li>)}</ul></div> : ""}
                    {groups_in_monitor && groups_in_monitor.length ? <div><h6>Groups</h6><ul>{groups_in_monitor.map(a => <li>{(_.find(agent_groups, { id: parseInt(a) }) || { name: "Group " + a }).name}</li>)}</ul></div> : ""}
                    {ivrs_in_monitor && ivrs_in_monitor.length ? <div><h6>IVRs</h6><ul>{ivrs_in_monitor.map(a => <li>{_.find(ivrs, { extension: a }).ivr_name}</li>)}</ul></div> : ""}
                    {exclude_interval ? <div><h6>Drop Call Interval</h6><ul><li>{exclude_interval}</li></ul></div> : ""}
                    {module_name ? <div><h6>Module</h6><ul><li>{module_name}</li></ul></div> : ""}
                    {sortField ? <div><h6>Selected Field</h6><ul><li>{exclude_interval}</li></ul></div> : ""}
                    {search_fileds && search_fileds.length ? <div><h6>Filters</h6><ul>{search_fileds.map(a => <li>{a}</li>)}</ul></div> : ""}
                </div> : ""}
            </CardBody>
        </Card>;
    }
}

function mapStateToProps({ queues, ivrs, groups_3cx }) {
    return {
        queues,
        ivrs,
        agent_groups: groups_3cx
    }
}

export default (connect(mapStateToProps, null)(Widget));