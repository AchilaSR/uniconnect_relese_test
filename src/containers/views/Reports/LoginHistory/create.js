import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadAgents, getLoginHistory } from '../../../../actions/reports';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';
import DateTimeRangePicker from '../../../../components/DateTimeRangePicker';
import { list3cxGroups } from '../../../../actions/configurations';
import ReportScheduleButton from "../../../../modules/report-automation/views/button";

class AgentActivityRptCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            extensions: [],
            statuses: [],
            groups: [],
            allExtensions: false,
            allStatuses: false,
            duration_start: moment(),
            duration_end: moment(),
            template_name: "",
            saveTemplate: false
        };
    }

    componentWillMount() {
        this.props.loadAgents();
        this.props.list3cxGroups();
    }

    getFilters() {
        let extensions = this.state.extensions;

        if (this.state.allExtensions) {
            extensions = this.props.agents;
        }

        extensions = _.map(extensions, "AgentExtension");

        if (this.state.group) {
            extensions = this.state.group.extensions;
        }

        if (!extensions || !extensions.length) {
            return;
        }

        return ({
            "agent_extension": extensions,
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

        this.props.getLoginHistory(filters);
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
                                />
                            </FormGroup>
                        </Col>
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
                                    isDisabled={this.state.allExtensions || this.state.group}
                                />
                                <FormGroup check>
                                    <Label check>
                                        <Input disabled={this.state.group} checked={this.state.allExtensions} onChange={() => this.setState({ allExtensions: !this.state.allExtensions })} type="checkbox" />{' '}
                                        Select all Agents
                                    </Label>

                                </FormGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        { <Col>
                            <ReportScheduleButton api={"getUserLoginHistory"} data={this.getFilters()} />
                        </Col> }
                        <Col className="text-right">
                            <Button disabled={!this.getFilters()} onClick={() => this.generateReport()} color="primary">Generate Report</Button>
                        </Col>
                    </Row>
                </CardBody >
            </Card>
        );
    }
}

function mapStateToProps({ agents, groups_3cx }) {
    return {
        agents,
        groups_3cx
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgents,
        getLoginHistory,
        list3cxGroups
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(AgentActivityRptCreate));