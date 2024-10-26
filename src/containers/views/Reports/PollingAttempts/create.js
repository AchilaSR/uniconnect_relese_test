import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button, InputGroup, InputGroupAddon, Input, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getQueuePollingStatistics } from '../../../../actions/reports';
import { listQueues } from '../../../../actions/configurations';
import Select from 'react-select';
import _ from 'lodash';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import { formatTimeToSeconds } from '../../../../config/util';
import ReportScheduleButton from "../../../../modules/report-automation/views/button";

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queue: "",
            date_range: {
                start: moment().startOf('month'),
                end: moment(),
            },
            duration_filter: ">=",
            duration: 0,
            data: null,
            allQueues: false,
            call_status: { value: "all", label: "All" }
        };
    }

    componentDidMount() {
        this.props.listQueues();
    }

    ReportData() {
        const { queue, date_range, call_status, allQueues } = this.state;

        if (!queue && !allQueues) {
            return;
        }

        let q = queue;
        if (allQueues) {
            q = this.props.queues;
        }

        const nextDay = date_range && date_range.end ? date_range.end.clone() : null;
        
        if (nextDay) {
            // Add a day to the cloned object
            nextDay.add(1, 'days');

            return {
                "queue": _.map(q, "extension").join(" "),
                "date_range": {
                    "start": date_range.start.format('YYYY-MM-DD'),
                    "end": nextDay.format('YYYY-MM-DD')
                },
                "call_status": call_status.value
            };
    
        }
    }


    generateReport() {
        const { queue, allQueues } = this.state;

        if (!queue && !allQueues) {
            alert("Please fill all the fields");
            return;
        }

        this.setState({ loading: true, duration_filter: ">=", duration: "0", phone: "" });

        const reportData = this.ReportData();

        this.props.getQueuePollingStatistics(reportData, (data) => {
            this.props.onSubmit(data);
            this.setState({ loading: false, data, filtered_logs: data });
        });
    }

    filterReport() {
        const filtered_logs = _.filter(this.state.data, (a) => {
            let matching = true;

            if (this.state.duration) {
                matching &= a.caller_waiting_during && eval(`${formatTimeToSeconds(a.caller_waiting_during)} ${this.state.duration_filter} ${this.state.duration} `)
            }

            if (this.state.phone) {
                matching &= a.caller_num.indexOf(this.state.phone) > -1;
            }

            return matching;
        });
        this.setState({ filtered_logs });
        this.props.onSubmit(filtered_logs);
    }

    render() {
        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Date Range</Label>
                            <DateRangePicker
                                minimumNights={0}
                                startDate={this.state.date_range.start}
                                startDateId="startDate"
                                endDate={this.state.date_range.end}
                                endDateId="endDate"
                                onDatesChange={({ startDate, endDate }) => this.setState({ date_range: { start: startDate, end: endDate } })}
                                focusedInput={this.state.focusedInput}
                                onFocusChange={focusedInput => this.setState({ focusedInput })}
                                orientation={this.state.orientation}
                                openDirection={this.state.openDirection}
                                disabled={false}
                                isOutsideRange={() => false}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Queues</Label>
                            <Select
                                value={this.state.queue}
                                options={this.props.queues}
                                onChange={(e) => this.setState({ queue: e })}
                                isMulti={true}
                                getOptionValue={option => option['extension']}
                                getOptionLabel={option => option['display_name']}
                                className="multi-select"
                                isClearable={true}
                                isDisabled={this.state.allQueues}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allQueues} onChange={() => this.setState({ allQueues: !this.state.allQueues })} type="checkbox" />{' '}
                                    Select all Queues
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Call Status</Label>
                            <Select
                                value={this.state.call_status}
                                options={[{ label: "All", value: "all" }, { label: "Answered", value: "answered" }, { label: "Unanswered", value: "unanswered" }]}
                                onChange={(e) => this.setState({ call_status: e })}
                                isMulti={false}
                                className="multi-select"
                                isClearable={false}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ReportScheduleButton
                            api={"getQueuePollingStatistics"}
                            data={this.ReportData()}
                        />
                    </Col>
                    <Col className="text-right">
                        <Button disabled={this.state.loading} onClick={() => this.generateReport()} color="primary">Generate Report</Button>
                    </Col>
                </Row>{
                    this.state.filtered_logs ?
                        <div className='mt-3'>
                            <Row>
                                <Col>
                                    <Alert color="info">
                                        <b>{this.state.filtered_logs.length}</b> calls out of{" "}
                                        <b>{this.state.data.length}</b> filtered
                                    </Alert>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="name">Phone Number</Label>
                                        <Input
                                            value={this.state.phone}
                                            onChange={(e) =>
                                                this.setState({ phone: e.target.value })
                                            }
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="name">Waiting Time</Label>
                                        <InputGroup>
                                            <Input value={this.state.duration_filter} onChange={(e) =>
                                                this.setState({ duration_filter: e.target.value })
                                            } type="select" name="select">
                                                <option value={">="}>More than</option>
                                                <option value={"<="}>Less than</option>
                                            </Input>
                                            <Input
                                                value={this.state.duration}
                                                type="number"
                                                min={0}
                                                onChange={(e) =>
                                                    this.setState({ duration: e.target.value })
                                                }
                                            />
                                            <InputGroupAddon addonType="append">Seconds</InputGroupAddon>
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-right">
                                    <Button onClick={() => this.filterReport()} color="primary">
                                        Filter
                                    </Button>
                                </Col>
                            </Row>
                        </div> : ""}
            </CardBody>
        );
    }
}


function mapStateToProps({ queues }) {
    return {
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listQueues,
        getQueuePollingStatistics
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);