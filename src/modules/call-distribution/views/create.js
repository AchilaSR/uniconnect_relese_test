
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import 'react-dates/initialize';
import Select from 'react-select';
import moment from 'moment';
import _ from 'lodash';
import { index } from '../action';
import { listQueues } from '../../../actions/configurations';
import { list3cxGroups } from '../../../actions/configurations';
import Loader from '../../../components/Loader';
import ReactDatePicker from 'react-datepicker';
import { formatMSecondsToTime } from '../../../config/util';
import ReportScheduleButton from "../../../modules/report-automation/views/button";

class DialerReports extends Component {
    constructor(props) {
        super(props);

        this.state = {
            duration_start: moment(),
            duration_end: moment(),
            agents: [],
            allAgents: false,
            group: [],
            queue: [],
            exclude_interval: 0,
            date: null,
            startDate: new Date(),
            scale: { value: 'hour', label: 'Hourly' },
            selectAllGroups: false,
            selectAllQueues: false,
            groupExtensions: []
        };
    }

    componentWillMount() {
        this.props.listQueues();
        this.props.list3cxGroups();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.groups_3cx) {
            // Store group extensions in the state when groups data is available
            this.setState({
                groupExtensions: nextProps.groups_3cx,
            });
        }
    }

    cancel() {
        this.setState({
            duration_start: moment(),
            duration_end: moment(),
            agents: [],
            // exclude_interval: 0,
            allAgents: false,
        });
    }

    getFilters() {
        let queue = [];
        let group = [];

        if (this.state.selectAllQueues) {
            this.props.queues.forEach(e => {
                queue.push(e.extension);
            });
        }else if(this.state.queue && this.state.queue.length){
            this.state.queue.forEach(e => {
                queue.push(e.extension);
            });
        }


        if (this.state.selectAllGroups) {
            this.props.groups_3cx.forEach(selectedGroup => {
                const groupWithExtensions = this.state.groupExtensions.find(group => group.id === selectedGroup.id);
                if (groupWithExtensions) {
                    group = group.concat(groupWithExtensions.extensions);
                }
            });
        }else if(this.state.group && this.state.group.length){
            this.state.group.forEach(selectedGroup => {
                const groupWithExtensions = this.state.groupExtensions.find(group => group.id === selectedGroup.id);
                if (groupWithExtensions) {
                    group = group.concat(groupWithExtensions.extensions);
                }
            });
        }

        

        return {
            queues_in_monitor: [...new Set(queue)],
            groups_in_monitor: [...new Set(group)],
            date: this.state.startDate.toISOString().split('T')[0],
            time_scale: this.state.scale.value,
            filter: formatMSecondsToTime(this.state.exclude_interval * 1000),
        };
    }


    save() {
        const filters = this.getFilters();
        const self = this;
        if (!filters || !filters.date || !filters.time_scale) {
            alert("Please fill all the fields");
            return;
        }

        if (filters.queues_in_monitor && !filters.queues_in_monitor.length) {
            alert("Please select a queue");
            return;
        }

        if (filters.groups_in_monitor && !filters.groups_in_monitor.length) {
            alert("Please select a group");
            return;
        }

        this.setState({ loading: true });
        this.props.getCallDistribution(filters, () => {
            self.setState({ loading: false });
            self.cancel();
        });
    }


    render() {
        const { groups_3cx, queues } = this.props;

        if (!groups_3cx || !queues) {
            return <Loader />;
        }

        return (
            <CardBody>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Queue</Label>
                            <Select
                                value={this.state.queue}
                                options={this.props.queues}
                                onChange={(e) => this.setState({ queue: e })}
                                isMulti={true}
                                getOptionValue={(option) => option["extension"]}
                                getOptionLabel={(option) => option["display_name"]}
                                className="multi-select"
                                placeholder="All Queues"
                                //disable selection when checked select all queues
                                isDisabled={this.state.selectAllQueues}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={this.state.selectAllQueues}
                                        onChange={() =>
                                            this.setState({
                                                selectAllQueues: !this.state.selectAllQueues,
                                            })
                                        }
                                    />
                                    Select all Queues
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Drop Call Interval (Sec)</Label>
                            <Input
                                value={this.state.exclude_interval}
                                placeholder="Dropped calls shorter than to exclude"
                                type="number"
                                min={0}
                                max={300}
                                onChange={(e) => this.setState({ exclude_interval: e.target.value })}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Group</Label>
                            <Select
                                value={this.state.group}
                                options={this.props.groups_3cx}
                                onChange={(e) => this.setState({ group: e })}
                                isMulti={true}
                                getOptionValue={(option) => option["id"]}
                                getOptionLabel={(option) => option["name"]}
                                className="multi-select"
                                placeholder="All Groups"
                                //disable selection when checked select all groups
                                isDisabled={this.state.selectAllGroups}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={this.state.selectAllGroups}
                                        onChange={() =>
                                            this.setState({
                                                selectAllGroups: !this.state.selectAllGroups,
                                            })
                                        }
                                    />
                                    Select all Groups
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label>Interval</Label>
                            <Select
                                value={this.state.scale}
                                options={[
                                    { value: 'hour', label: 'Hourly' },
                                    { value: 'day', label: 'Daily' },
                                    { value: 'month', label: 'Monthly' }
                                ]}
                                onChange={(e) => this.setState({ scale: e })}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label>{this.state.scale.value === 'month' ? "Year" : this.state.scale.value === 'day' ? "Month" : "Date"}</Label>
                            <ReactDatePicker
                                value={this.state.date}
                                selected={this.state.startDate}
                                onChange={(e) => this.setState({ startDate: e })}
                                maxDate={new Date()}
                                dateFormat={this.state.scale.value === 'month' ? "yyyy" : this.state.scale.value === 'day' ? "yyyy-MM" : "yyyy-MM-dd"}
                                className="form-control"
                                showMonthYearPicker={this.state.scale.value === 'day'}
                                showYearPicker={this.state.scale.value === 'month'}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="2">
                        <ReportScheduleButton
                            api={"getQueueStatisticsData"}
                            data={this.getFilters()}
                        />
                    </Col>
                    <Col xs="10" className="text-right">
                        <Button disabled={this.state.loading} onClick={() => this.save()} color="primary" > {this.state.loading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""}  Generate Report</Button>{' '}
                    </Col>
                </Row>
            </CardBody >
        );
    }
}

function mapStateToProps({ groups_3cx, queues, call_distribution }) {
    return {
        groups_3cx,
        queues,
        call_distribution
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        list3cxGroups,
        listQueues,
        getCallDistribution: index
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DialerReports);
