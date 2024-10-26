
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import Select from 'react-select';
import moment from 'moment';
import _ from 'lodash';

import { getDispositionReport } from '../../../../actions/reports'; 
import { loadCampaigns, loadLeadStatuses } from '../../../../actions/campaigns';
import { listQueues } from '../../../../actions/configurations';
import { listGroups } from '../../../../actions/groups';
import { listUsers } from '../../../../actions/users';

import Loader from '../../../../components/Loader';

class DialerReports extends Component {
    constructor(props) {
        super(props);

        this.state = {
            report_type: "PDF",
            mature_days: 100,
            scheduled_on_start: moment(),
            scheduled_on_end: moment(),
            dialed_on_start: moment(),
            dialed_on_end: moment(),
            camapign_created_on_start: moment(),
            camapign_created_on_end: moment(),
            agents: [],
            groups: [],
            campaigns: [],
            statuses: [],
            allAgents: true,
            allGroups: true,
            allCampaigns: false,
            allStatuses: true,
            allQueues: true
        };
    }

    componentWillMount() {
        this.props.loadCampaigns();
        this.props.loadLeadStatuses();
        this.props.listGroups();
        this.props.listUsers();
        this.props.listQueues();
    }

    cancel() {
        this.setState({
            report_type: "PDF",
            mature_days: 100,
            scheduled_on_start: moment(),
            scheduled_on_end: moment(),
            dialed_on_start: moment(),
            dialed_on_end: moment(),
            camapign_created_on_start: moment(),
            camapign_created_on_end: moment(),
            agents: [],
            groups: [],
            campaigns: [],
            statuses: [],
            allAgents: true,
            allGroups: true,
            allCampaigns: true,
            allStatuses: true,
            allQueues: true
        });
    }

    save() {
        const self = this;

        let agents = this.state.agents;
        let groups = this.state.groups;
        let campaigns = this.state.campaigns;
        let statuses = this.state.statuses;
        let outbound_queues = this.state.outbound_queue;

        if (this.state.allAgents) {
            agents = this.props.users;
        }

        if (this.state.allGroups) {
            groups = this.props.groups;
        }

        if (this.state.allStatuses) {
            statuses = this.props.leadstatus;
        }

        if (this.state.allCampaigns) {
            campaigns = this.props.campaigns;
        }

        if (this.state.allQueues) {
            outbound_queues = this.props.queues;
        }

        // if (!this.state.report_type ||
        //     !this.state.mature_days ||
        //     !this.state.scheduled_on_start || !this.state.scheduled_on_end ||
        //     !this.state.dialed_on_start || !this.state.dialed_on_end ||
        //     !this.state.camapign_created_on_start || !this.state.camapign_created_on_end ||
        //     campaigns.length === 0 ||
        //     statuses.length === 0
        // ) {
        //     alert("Please fill all the feilds");
        //     return;
        // }

        // if (agents.length + groups.length === 0) {
        //     alert("Please select an agent or a group");
        //     return;
        // }

        // if (_.indexOf(this.props.templates, this.state.report_name) > -1) {
        //     alert("This campaign name is already used. Please enter a unique name.");
        //     return;
        // }

        let data = {
            "report_name": this.state.report_name,
            "report_type": this.state.report_type,
            "mature_days": this.state.mature_days,
            "scheduled_on_start": this.state.scheduled_on_start.format('YYYY-MM-DD HH:mm:ss'),
            "scheduled_on_end": this.state.scheduled_on_end.format('YYYY-MM-DD HH:mm:ss'),
            "dialed_on_start": this.state.dialed_on_start.format('YYYY-MM-DD HH:mm:ss'),
            "dialed_on_end": this.state.dialed_on_end.format('YYYY-MM-DD HH'),
            "camapign_created_on_start": this.state.camapign_created_on_start.format('YYYY-MM-DD HH:mm:ss'),
            "camapign_created_on_end": this.state.camapign_created_on_end.format('YYYY-MM-DD HH:mm:ss'),
            "agent_id_list": _.map(agents, "login_id"),
            // "campaign_id_list": _.map(campaigns, "campign_id"),
            "campaign_id_list": [campaigns.campign_id],
            "group_id_list": _.map(groups, "group_id"),
            "status_id_list": _.map(statuses, "statuscode"),
            "outbound_queues": _.map(outbound_queues, "extension")
        };
        this.props.getDispositionReport(data, function () {
            self.cancel();
        });
    }

    render() {
        const { users, groups, campaigns, leadstatus } = this.props;

        if (!users || !groups || !campaigns || !leadstatus) {
            return <Loader />;
        }

        return (
            <CardBody>
                {/* <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="ccnumber">Campaign Schedule</Label>
                            <DateRangePicker
                                startDate={this.state.scheduled_on_start}
                                startDateId="cs_startDate"
                                endDate={this.state.scheduled_on_end}
                                endDateId="cs_endDate"
                                onDatesChange={({ startDate, endDate }) => this.setState({ scheduled_on_start: startDate, scheduled_on_end: endDate })}
                                focusedInput={this.state.cs_focusedInput}
                                onFocusChange={cs_focusedInput => this.setState({ cs_focusedInput })}
                                orientation={this.state.orientation}
                                openDirection={this.state.openDirection}
                                disabled={false}
                                isOutsideRange={() => false}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="ccnumber">Dialed Date</Label>
                            <DateRangePicker
                                startDate={this.state.dialed_on_start}
                                startDateId="dd_startDate"
                                endDate={this.state.dialed_on_end}
                                endDateId="dd_endDate"
                                onDatesChange={({ startDate, endDate }) => this.setState({ dialed_on_start: startDate, dialed_on_end: endDate })}
                                focusedInput={this.state.dd_focusedInput}
                                onFocusChange={dd_focusedInput => this.setState({ dd_focusedInput })}
                                orientation={this.state.orientation}
                                openDirection={this.state.openDirection}
                                disabled={false}
                                isOutsideRange={() => false}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Agents</Label>
                            <Select
                                value={this.state.agents}
                                options={this.props.users}
                                onChange={(e) => this.setState({ agents: e })}
                                isMulti={true}
                                getOptionValue={option => option['login_id']}
                                getOptionLabel={option => option['first_name'] + ' ' + option['last_name']}
                                className="multi-select"
                                isDisabled={this.state.allAgents}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allAgents} onChange={() => this.setState({ allAgents: !this.state.allAgents })} type="checkbox" />{' '}
                                    Select all Agents
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Services</Label>
                            <Select
                                value={this.state.outbound_queue}
                                options={this.props.queues}
                                onChange={(e) => this.setState({ outbound_queue: e })}
                                isMulti={true}
                                isDisabled={this.state.allQueues}
                                getOptionValue={option => option['extension']}
                                getOptionLabel={option => option['display_name']}
                                className="multi-select"
                                isClearable={true}
                                required
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allQueues} onChange={() => this.setState({ allQueues: !this.state.allQueues })} type="checkbox" />{' '}
                                    Select all Services
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row> */}
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Campaigns</Label>
                            <Select
                                value={this.state.campaigns}
                                options={this.props.campaigns}
                                onChange={(e) => this.setState({ campaigns: e })}
                                isMulti={false}
                                getOptionValue={option => option['campign_id']}
                                getOptionLabel={option => option['campaign_name']}
                                className="multi-select"
                                isDisabled={this.state.allCampaigns}
                            />
                            {/* <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allCampaigns} onChange={() => this.setState({ allCampaigns: !this.state.allCampaigns })} type="checkbox" />{' '}
                                    Select all Campaigns
                                </Label>
                            </FormGroup> */}
                        </FormGroup>
                    </Col>
                </Row>
                {/* <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Statuses</Label>
                            <Select
                                value={this.state.statuses}
                                options={this.props.leadstatus}
                                onChange={(e) => this.setState({ statuses: e })}
                                isMulti={true}
                                getOptionValue={option => option['statuscode']}
                                getOptionLabel={option => option['statusname']}
                                className="multi-select"
                                isDisabled={this.state.allStatuses}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allStatuses} onChange={() => this.setState({ allStatuses: !this.state.allStatuses })} type="checkbox" />{' '}
                                    Select all Statuses
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row> */}
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.save()} color="primary">Generate Report</Button>{' '}
                    </Col>
                </Row>
            </CardBody >
        );
    }
}

function mapStateToProps({ users, groups, leadstatus, campaigns, queues }) {
    return {
        users,
        groups,
        leadstatus,
        campaigns,
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadCampaigns, loadLeadStatuses, listUsers, listGroups, getDispositionReport, listQueues
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DialerReports);
