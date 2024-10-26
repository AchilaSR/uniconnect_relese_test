import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadAgentActivities, loadAgents, loadAgentActivityLogReport } from '../../../../actions/reports';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';
import DateTimeRangePicker from '../../../../components/DateTimeRangePicker';
import { list3cxGroups } from '../../../../actions/configurations';
import ReportScheduleButton from '../../../../modules/report-automation/views/button';

class AgentActivityRptCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            extensions: [],
            statuses: [],
            group: [],
            allExtensions: false,
            allStatuses: false,
            duration_start: moment(),
            duration_end: moment(),
            template_name: "",
            saveTemplate: false,
            allgroupExtensions: false
        };
    }

    componentWillMount() {
        this.props.loadAgents();
        this.props.loadAgentActivities();
        this.props.list3cxGroups();
    }

    getFilters() {
        let statuses = this.state.statuses;
        let extensions = this.state.extensions;

        if (extensions && Array.isArray(extensions)) {
            extensions = extensions.map(extension => extension.AgentExtension);
        }

        if (this.state.allStatuses) {
            statuses = [...this.props.agent_activities, { id: 0 }];
        }

        if (this.state.allExtensions) {
            extensions = this.props.agents.map(agent => agent.AgentExtension);
        }

        if (this.state.group && this.state.group.length) {
            extensions = this.state.group.extensions;
        }

        if (this.state.group && this.state.group.length) {
            let extensionsSet = new Set();
            this.state.group.forEach(item => {
                item.extensions.forEach(extension => {
                    extensionsSet.add(extension);
                });
            });
            extensions = Array.from(extensionsSet);

            if (extensions.length == 0) {
                extensions.push("0")
            }
        }

        if (this.state.allgroupExtensions) {
            let extensionsSet = new Set();
            this.props.groups_3cx.forEach(item => {
                item.extensions.forEach(extension => {
                    extensionsSet.add(extension);
                });
            });
            extensions = Array.from(extensionsSet);
        }


        if (!statuses || !extensions || !statuses.length || !extensions.length) {
            return;
        }

        if (this.state.saveTemplate && !this.state.template_name) {
            return;
        }

        return ({
            "agent_extension": extensions,
            "status_codes": _.map(statuses, "id"),
            "duration": {
                "start_time": this.state.duration_start.format('YYYY-MM-DD HH:mm:ss'),
                "end_time": this.state.duration_end.format('YYYY-MM-DD HH:mm:ss')
            }
        });
    }

    generateReport() {
        const filters = this.getFilters();

        if (!filters) {
            alert("Please fill all the feilds");
            return;
        }

        this.props.loadAgentActivityLogReport(filters);
    }


    deleteTmpl(e) {
        if (window.confirm("Are you sure, you want to delete this template?")) {
            this.props.deleteAgentActivityTemplates(e);
        }
    }

    getAgentGroups() {
        let groups = _.map(this.props.agents, "AgentGroup");
        groups = _.uniq(groups);
        return _.map(groups, (a) => ({
            value: a, label: a
        }));
    }

    selectGroup(e) {
        const extensions = _.filter(this.props.agents, (a) => {
            return _.map(e, "value").indexOf(a.AgentGroup) > -1;
        });

        this.setState({ groups: e, extensions })
    }

    render() {
        return (
            <Card className="mr-3" style={{ flexShrink: 0, width: 300 }}>
                <CardHeader>Report Settings</CardHeader>
                <CardBody>
                    <DateTimeRangePicker
                        startDate={this.state.duration_start}
                        endDate={this.state.duration_end}
                        onDatesChange={({ startDate, endDate }) => this.setState({ duration_start: startDate, duration_end: endDate })}
                    />
                    <Row>
                        {this.props.groups_3cx &&
                            <Col>
                                <FormGroup>
                                    <Label htmlFor="name">Group</Label>
                                    <Select
                                        value={this.state.group}
                                        options={this.props.groups_3cx}
                                        onChange={(e) => this.setState({ group: e })}
                                        className="multi-select"
                                        getOptionValue={(option) => option["id"]}
                                        getOptionLabel={(option) => option["name"]}
                                        isClearable={true}
                                        isMulti={true}
                                        isDisabled={this.state.allExtensions || (this.state.extensions && this.state.extensions.length !== 0)}
                                    />
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={this.state.allgroupExtensions}
                                                disabled={this.state.allExtensions || (this.state.extensions && this.state.extensions.length !== 0)}
                                                onChange={() =>
                                                    this.setState({
                                                        allgroupExtensions: !this.state.allgroupExtensions,
                                                    })
                                                }
                                            />
                                            Select all Groups
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Col>}

                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Agents</Label>
                                <Select
                                    value={this.state.extensions}
                                    options={this.props.agents}
                                    onChange={(e) => this.setState({ extensions: e })}
                                    isMulti={true}
                                    getOptionValue={option => option['AgentID']}
                                    getOptionLabel={option => option['AgentName']}
                                    className="multi-select"
                                    isDisabled={this.state.allExtensions || (this.state.group && this.state.group.length != 0) || this.state.allgroupExtensions}
                                />
                                <FormGroup check>
                                    <Label check>
                                        <Input disabled={this.state.group && this.state.group.length != 0 || this.state.allgroupExtensions}
                                            checked={this.state.allExtensions}
                                            onChange={() => this.setState({ allExtensions: !this.state.allExtensions })} type="checkbox" />{' '}
                                        Select all Agents
                                    </Label>

                                </FormGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Status</Label>
                                <Select
                                    value={this.state.statuses}
                                    options={this.props.agent_activities}
                                    onChange={(e) => this.setState({ statuses: e })}
                                    isMulti={true}
                                    getOptionValue={option => option['id']}
                                    getOptionLabel={option => option['status_name']}
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
                    </Row>
                    <Row>
                        <Col>
                            <ReportScheduleButton api={"getAgentActivityReport"} data={this.getFilters()} />
                        </Col>
                        <Col className="text-right">
                            <Button disabled={!this.getFilters()} onClick={() => this.generateReport()} color="primary">Generate Report</Button>
                        </Col>
                    </Row>
                </CardBody >
            </Card>
        );
    }
}

function mapStateToProps({ agents, agent_activities, groups_3cx }) {
    return {
        agents,
        agent_activities,
        groups_3cx
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgents,
        loadAgentActivities,
        loadAgentActivityLogReport,
        list3cxGroups
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(AgentActivityRptCreate));