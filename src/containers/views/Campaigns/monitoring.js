import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Container, ListGroup, ListGroupItem, Progress, Row, Table } from 'reactstrap';
import { Pie, Bar, HorizontalBar } from 'react-chartjs-2';
import moment from 'moment';
import { loadCampaigns, loadLeadStatuses } from '../../../actions/campaigns';
import { formatCurrency } from '../../../config/util';
import { getCallDataReport, getDialListSummary, loadAgents } from '../../../actions/reports';
import StatBox from '../../../modules/dashboards/components/stat-box';
import Fullscreen from "react-full-screen";
import { list3cxGroups, listQueues } from '../../../actions/configurations';
import { getLineStatus } from '../../../modules/line-status/action';
import { loadFacilities } from '../../../actions/facilities';
import { CAMPAIGN_REFRESH_INTERVAL } from '../../../config/globals';
import AgentsInCampaign from './agents-in-campaign';
import Loader from '../../../components/Loader';
import { listUsers } from '../../../actions/users';

class CampaignMonitoring extends Component {
    constructor(props) {
        super(props)
        this.state = {
            campaign_id: null,
            isFull: false
        }
    }

    componentDidMount() {
        this.props.loadLeadStatuses();
        this.props.listQueues();
        this.props.list3cxGroups();
        this.props.loadAgents();
        this.props.listUsers();
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.match.params) !== JSON.stringify(prevProps.match.params)) {
            this.init();
        }

        if (this.props.campaigns) {
            const campaign = _.find(this.props.campaigns, { campign_id: this.state.campaign_id });
            let prev_campaign = null;

            if (prevProps.campaigns) {
                prev_campaign = _.find(prevProps.campaigns, { campign_id: this.state.campaign_id });
            }

            if (campaign && campaign !== prev_campaign) {
                this.refresh();
            }
        }
    }

    init() {
        this.setState({ campaign_id: parseInt(this.props.match.params.id) });
        this.props.loadCampaigns();
        this.refreshIntervalCampaign = setInterval(() => {
            this.props.loadCampaigns();
        }, CAMPAIGN_REFRESH_INTERVAL * 1000)
    }

    componentWillUnmount() {
        window.clearInterval(this.refreshIntervalCampaign);
    }

    refresh() {
        this.setState({ campaign: _.find(this.props.campaigns, { campign_id: this.state.campaign_id }) }, () => {
            const queue = this.state.campaign.outbound_queue;
            this.props.getDialListSummary({
                "interval":"",
                "filterByUpload": false,
                "ids": [this.state.campaign.campign_id],
                "startDate": null,
                "endDate": null
            }, (data) => {
                if (data && data.length) {
                    this.setState({ campaign_summary: data[0] })
                }
            });

            let data = {
                "campaign_id": this.state.campaign.campign_id,
                "limit": 1000000,
                "offset": 0,
                "phone": null,
                "disposition": null,
                "status": []
            }
            this.props.loadFacilities(data, (err, data) => {
                this.setState({ leads: data })
            });

            this.props.getCallDataReport({
                campaign_id: this.state.campaign.campign_id,
                queue: null,
                startDate: null,
                endDate: null,
                extension: null,
                number: null
            }, () => { });

            this.props.getLineStatus(queue, () => {
                let queued = 0;
                let answered = 0;

                if (this.props.queue_calls && this.props.queue_calls.queued && this.props.queue_calls.queued[queue]) {
                    queued += this.props.queue_calls.queued[queue].length;
                }

                if (this.props.queue_calls && this.props.queue_calls.answered && this.props.queue_calls.answered[queue]) {
                    answered += this.props.queue_calls.answered[queue].length;
                }

                this.setState({ queued: queued + answered, waiting: queued })
            })

        });
    }

    getDialingType(campaign) {
        switch (campaign.dialing_type) {
            case 1:
                return <Badge color='danger'>Predictive</Badge>
            case 2:
                return <Badge color='success'>Preview</Badge>
            case 3:
                return <div><Badge color='warning'>Power</Badge> at dialing speed {campaign.dialing_speed}</div>
        }
    }

    getColor(color) {

        const colors = {
            "GREEN": "#018839",
            "BROWN": "#8f5b0d",
            "YELLOW": "#f1c40f",
            "LIGHT_GREEN": "#cce00e",
            "LIGHT_RED": "#f08172",
            "ORANGE": "#e67e22",
            "GRAY": "#34495e",
            "RED": "#e62f22",
            "white": "#dadada",
            "bronze": "#ad8a56"
        };
        return colors[color] || color;
    }

    getChart(stats) {
        return {
            datasets: [{
                data: stats.map((a) => a.lead_count),
                backgroundColor: this.props.leadstatus.map((a) => this.getColor(a.colorcode)),
                borderWidth: 1
            }],
            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: this.props.leadstatus.map((a) => a.statusdescription)
        };
    }

    getLeadChart(calls) {
        const startTimes = calls.map(item => moment(item.start_time));

        const minTime = moment.min(startTimes);
        const maxTime = moment.max(startTimes);

        const duration = maxTime.diff(minTime, 'minutes');

        let round = 'second';

        if (duration < 5) {
            round = 'second';
        } else if (duration < 240) {
            round = 'minute';
        } else if (duration < 1440) {
            round = 'hour'
        } else if (duration < (30 * 1440)) {
            round = 'day'
        } else if (duration < (365 * 1440)) {
            round = 'week'
        } else {
            round = 'month';
        }

        const chartOpts = {
            legend: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: { stepSize: 1 }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: round,
                    }
                }]
            }

        };

        const groupedCalls = calls.reduce((acc, call) => {
            // Extract the 'yyyy-mm-dd hh:mm' part from start_time
            const dateTime = moment(call.start_time).startOf(round);

            if (!acc[dateTime]) {
                acc[dateTime] = { answered: 0, unanswered: 0 };
            }

            if (call.is_answered) {
                acc[dateTime].answered += 1;
            } else {
                acc[dateTime].unanswered += 1;
            }

            return acc;
        }, {});

        return {
            options: chartOpts,
            data: {
                datasets: [{
                    label: "Answered",
                    data: Object.values(groupedCalls).map((a) => a.answered),
                    backgroundColor: "#cce00e",
                    stack: "calls"
                },
                {
                    label: "Unanswered",
                    data: Object.values(groupedCalls).map((a) => a.unanswered),
                    backgroundColor: "#f08172",
                    stack: "calls"
                }],
                labels: Object.keys(groupedCalls)
            }
        };
    }

    getAnsweredChart(calls) {
        const groupedCalls = calls.reduce((acc, call) => {
            // Extract the 'yyyy-mm-dd hh:mm' part from start_time
            const attempt = call.attempt;

            if (!acc[attempt]) {
                acc[attempt] = { answered: 0, unanswered: 0 };
            }

            for (let i = 0; i < attempt; i++) {
                if (!acc[i]) {
                    acc[i] = { answered: 0, unanswered: 0 };
                }
                acc[i].unanswered += 1;
            }

            if (call.dialing_status_id === 6) {
                acc[attempt].answered += 1;
            } else {
                acc[attempt].unanswered += 1;
            }

            return acc;
        }, {});

        return {
            datasets: [
                {
                    label: "Unanswered",
                    data: Object.values(groupedCalls).map((a) => a.unanswered),
                    backgroundColor: "#f08172",
                    stack: "calls"
                },
                {
                    label: "Answered",
                    data: Object.values(groupedCalls).map((a) => a.answered),
                    backgroundColor: "#cce00e",
                    stack: "calls"
                }],

            labels: Object.keys(groupedCalls)
        };
    }

    renderAlerts() {
        const { campaign, agent_status, leads } = this.state;

        const errors = [];
        const warnings = [];

        if (campaign.campaign_status === "STOPPED") {
            errors.push("Campaign is stopped")
        }

        if (!moment().isBetween(moment(campaign.scheduled_start_time, 'YYYY-MM-DD HH:mm:ss'), moment(campaign.scheduled_end_time, 'YYYY-MM-DD HH:mm:ss'))) {
            errors.push("Campaign schedule time is out of range")
        }

        if (leads) {
            const pending_leads = leads.filter((a) => [5, 6].indexOf(a.dialing_status_id) === -1 && a.attempt <= campaign.retry_attempts);
            const follow_up_leads = leads.filter((a) => [3].indexOf(a.dialing_status_id) > -1 && a.attempt <= campaign.retry_attempts && moment(a.next_follow_up_on).isAfter());
            if (!pending_leads.length) {
                errors.push("No leads are pending to dial / retry / follow-up");
            } else if (pending_leads.length === follow_up_leads.length) {
                warnings.push(pending_leads.length + " leads has follow-ups scheduled for a future date");
            }
        }

        if (agent_status) {
            const available_agents = agent_status.filter((a) => a.status_id === 1 && a.queue_status && a.queue_status.status === "Logged In")
            if (!available_agents.length) {
                errors.push("No agents available to accept incoming calls");
            }
            // errors.push(available_agents.length + " agents available to accept incoming calls");
        }


        if (campaign.dialing_type !== 2 && !campaign.retry_interval) {
            warnings.push("Campaign retry interval is not mentioned");
        }

        if (errors.length) {
            return errors.map((err) => <Alert className='pb-1 pt-0 px-3 my-1' color='danger'>{err}</Alert>)
        } else if (warnings.length) {
            return warnings.map((err) => <Alert className='pb-1 pt-0 px-3 my-1' color='warning'>{err}</Alert>)
        } else {
            return <Alert className='pb-1 pt-0 px-3 my-1' color='success'>Campaign is running</Alert>
        }
    }

    renderProgress(code, cell, total = 1, row) {
        const { leadstatus } = this.props;
        const color = _.find(leadstatus, ['statuscode', code]).colorcode;

        const name = _.find(leadstatus, ['statuscode', code]).statusdescription;
        const value = _.find(cell, ['stat_code', code]) ? _.find(cell, ['stat_code', code]).lead_count : 0;

        if (value) {
            return <Progress
                animated={row.campaign_status === "RUNNING" && color === "GREEN"}
                className="tooltip-target" bar max={total} color={color} value={value} >
                {value}
                <span className={`bg-${color} tooltip-content`}>{`${value} ${name}`}</span>
            </Progress>
        } else {
            return ""
        }

    }

    renderLegendRow(a) {
        const count = (_.find(this.state.campaign.CampaignLeadsStats, { stat_code: a.statuscode }) || { lead_count: 0 }).lead_count;
        if (count > 0) {
            return <tr>
                <td><div style={{ backgroundColor: this.getColor(a.colorcode), width: 15, height: 15, borderRadius: 3 }}>&nbsp;</div></td>
                <td>{a.statusdescription}</td>
                <td className='text-right'>{formatCurrency(count, 0)}</td>
            </tr>
        }
    }

    getUsername(extension_id) {
        const user = _.find(this.props.agents, { "AgentExtension": extension_id });
        if (user) {
            return `[${user.AgentExtension}] ${user.AgentName}`;
        } else {
            return "";
        }
    }

    render() {
        const { campaign, campaign_summary, leads } = this.state;
        const { queues, leadstatus, call_data } = this.props;

        let recent_leads;
        let other_campaigns;

        if (leads) {
            recent_leads = leads.filter(a => a.dialed_on).sort((a, b) => moment(b.dialed_on) - moment(a.dialed_on));
        }

        if (this.props.campaigns && campaign && leadstatus) {
            other_campaigns = this.props.campaigns.filter((a) => a.campign_id !== campaign.campign_id && a.campaign_status === "RUNNING")
        }

        const ansChartOpts = {
            legend: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: { stepSize: 1 }
                }],
            }

        };

        if (!campaign) {
            return <Loader />
        }

        return <div className="animated fadeIn">
            <ol className="breadcrumb">
                <li className="breadcrumb-item active">Campaign Monitor</li>
                <li className="breadcrumb-menu">
                    <div className="btn-group">
                        <a className="btn" onClick={() => this.setState({ isFull: true })}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                    </div>
                </li>
            </ol>
            <Fullscreen
                enabled={this.state.isFull}
                onChange={isFull => this.setState({ isFull })}
            >
                <div className="container-fluid">
                    <Row>
                        <Col md="4" lg="3">
                            <Card>
                                <CardHeader>Campaign Details</CardHeader>
                                <CardBody>
                                    <div className='d-flex align-items-start justify-content-between'>
                                        <h5>[{campaign.campign_id}] {campaign.campaign_name}</h5>
                                        {/* {campaign.campaign_status === "RUNNING" ? <Badge color="success">Running</Badge> : ""} */}
                                    </div>
                                    <div>
                                        {
                                            this.renderAlerts()
                                        }
                                    </div>
                                    {this.props.queues && _.find(this.props.queues, { extension: campaign.outbound_queue }) ? <div className='mt-1'>
                                        <small>Queue</small><br />
                                        <div>[{campaign.outbound_queue}] - {_.find(this.props.queues, { extension: campaign.outbound_queue }).display_name}</div>
                                    </div> : ""}
                                    <div className='mt-1'>
                                        <small>Dialing Mode</small><br />
                                        <div>{this.getDialingType(campaign)}</div>
                                    </div>
                                    <div className='mt-1'>
                                        <small>Schedule</small><br />
                                        <div>{campaign.scheduled_start_time} to {campaign.scheduled_end_time}</div>
                                    </div>
                                    <div className='mt-1'>
                                        <small>Last Running On</small><br />
                                        <div>{campaign.last_started_on} to {campaign.last_ends_on ? campaign.last_ends_on : "now"}</div>
                                    </div>
                                    {campaign.retry_attempts > 1 ?
                                        <div className='mt-1'>
                                            <small>Retry Attempts</small><br />
                                            <div>{campaign.retry_attempts} times {campaign.dialing_type === 2 && campaign.retry_interval ? "" : ` at ${campaign.retry_interval} seconds interval`}</div>
                                        </div> : ""
                                    }
                                    {campaign.CampaignLeadsStats && this.props.leadstatus ? <div>
                                        <hr />
                                        <h6>Leads by Status</h6>
                                        <div className='my-3 d-flex'>
                                            <Pie data={this.getChart(campaign.CampaignLeadsStats)} options={{ legend: false }} height={150} />
                                        </div>
                                        <Table size='sm'>
                                            {this.props.leadstatus.map((a) =>
                                                this.renderLegendRow(a))}
                                        </Table>
                                    </div> : ""}
                                    {leads ?
                                        <div>
                                            <h6>Answered by Attempts</h6>
                                            <div style={{ height: Math.max((_.max(_.map(leads, 'attempt')) * 15) + 50, 120) }}>
                                                <HorizontalBar data={this.getAnsweredChart(leads)} options={ansChartOpts} />
                                            </div>
                                        </div> : ""}
                                </CardBody>
                            </Card>
                            {
                                other_campaigns && other_campaigns.length ?
                                    <Card>
                                        <CardHeader>Other Ongoing Campaigns</CardHeader>
                                        <ListGroup>
                                            {
                                                other_campaigns.map((a) => <ListGroupItem>
                                                    <div className='d-flex justify-content-between align-items-end'>
                                                        <div className='flex-grow-1'>
                                                            {a.campaign_name}
                                                            <Progress multi>
                                                                {leadstatus.map((b) => this.renderProgress(b.statuscode, a.CampaignLeadsStats, a.total_leads, a))}
                                                            </Progress>
                                                        </div>
                                                        <div className='pl-3'>
                                                            <Button size="sm" outline onClick={() => this.props.history.push(`/campaign/${a.campign_id}/monitor`, a)}><i className='fa fa-dashboard'></i></Button>
                                                        </div>
                                                    </div>

                                                </ListGroupItem>)
                                            }
                                        </ListGroup>
                                    </Card> : ""

                            }
                        </Col>
                        <Col md="8" lg="9">
                            {campaign_summary ? <Card>
                                <CardHeader>
                                    Campaign Summary
                                </CardHeader>
                                <CardBody>
                                    <Row className='px-3'>
                                        <StatBox size={2} label="Total Leads" value={campaign_summary.list_count} />
                                        <StatBox size={2} label="Unique Answered Count" value={campaign_summary.unique_answered_count} sub_value={formatCurrency(campaign_summary.unique_answered_count / campaign_summary.list_count * 100) + "%"} />
                                        <StatBox size={2} label="Total Dialed Count" value={campaign_summary.total_dialed_count} />
                                        <StatBox size={2} label="Total Answered Count" value={campaign_summary.total_answered_count} sub_value={formatCurrency(campaign_summary.total_answered_count / campaign_summary.total_dialed_count * 100) + "%"} />
                                        <StatBox size={2} value={this.state.queued} sub_value={this.state.waiting ? this.state.waiting + " waiting" : ""} label="Calls in Queue" />
                                        <StatBox size={2} label="Current Attempt" format={false} value={_.max(_.map(leads, 'attempt'))} />
                                    </Row>
                                </CardBody>
                            </Card> : ""}
                            <Row>
                                <Col lg="6">
                                    <Card>
                                        <CardHeader>Agents in Campaign</CardHeader>
                                        <CardBody>
                                            <AgentsInCampaign leads={leads} onStatusChanged={(data) => this.setState({ agent_status: data })} queue={campaign.outbound_queue} />
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col lg="6">
                                    {recent_leads && this.props.queues && this.props.agents ? <Card>
                                        <CardHeader>Recent Calls</CardHeader>
                                        <CardBody>
                                            <Table className='mb-0' size='sm' bordered>
                                                <tr>
                                                    <th style={{ width: 30 }}></th>
                                                    <th style={{ width: 100 }}>Number</th>
                                                    <th style={{ width: 140 }}>Dialed Time</th>
                                                    <th>Agent</th>
                                                </tr>
                                                {
                                                    recent_leads.slice(0, Math.max(10, _.find(queues, { extension: campaign.outbound_queue }).extensions.length)).map((a) =>
                                                        <tr>
                                                            <td className='text-center p-0'><div style={{ fontSize: 10, padding: 0, lineHeight: "20px", fontWeight: "bold", color: "#ffffff", display: "inline-block", backgroundColor: this.getColor(_.find(this.props.leadstatus, ['statuscode', a.dialing_status_id]).colorcode), width: 20, height: 20, borderRadius: 3, }}>{a.attempt}</div></td>
                                                            <td>{a.number}</td>
                                                            <td>{moment(a.dialed_on).format("YYYY-MM-DD HH:mm:ss")}</td>
                                                            <td>{this.getUsername(a.extension)}</td>
                                                        </tr>
                                                    )
                                                }
                                            </Table>
                                        </CardBody>
                                        {/* {JSON.stringify(this.props.agents)} */}
                                    </Card> : ""}
                                </Col>
                            </Row>
                            {this.props.call_data ? <Card>
                                <CardHeader>Time Line</CardHeader>
                                <CardBody>
                                    <div style={{ height: 150 }}>
                                        <Bar {...this.getLeadChart(this.props.call_data)} />
                                    </div>
                                </CardBody>
                            </Card> : ""}

                        </Col>
                    </Row>
                </div>
            </Fullscreen>
        </div>
    }
}

function mapStateToProps({ leadstatus, line_status, call_data, agents, queue_calls, queues, campaigns, users }) {
    return {
        leadstatus,
        line_status,
        call_data,
        agents,
        queue_calls,
        queues,
        campaigns,
        users
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadLeadStatuses,
        getDialListSummary,
        listQueues,
        list3cxGroups,
        getLineStatus,
        loadFacilities,
        getCallDataReport,
        loadAgents,
        loadCampaigns,
        listUsers
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignMonitoring);