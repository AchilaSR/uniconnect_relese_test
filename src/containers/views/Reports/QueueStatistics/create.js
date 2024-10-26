import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadQueueStatistics } from '../../../../actions/reports';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import TimeRangeSlider from 'react-time-range-slider';
import { listQueues } from '../../../../actions/configurations';
import Select from 'react-select';
import _ from 'lodash';
import { formatMSecondsToTime } from '../../../../config/util';
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
            hour_range: {
                start: "00:00",
                end: "23:59"
            },
            exclude_interval: 0,
            allQueues: false
        };
    }

    componentWillMount() {
        this.props.listQueues();
    }

    getFilters() {
        const { queue, date_range, hour_range, exclude_interval } = this.state;

        let selectedQueues = queue;

        if (this.state.allQueues) {
            selectedQueues = this.props.queues;
        }

        if (!selectedQueues) {
            return;
        }

        return {
            queues: _.map(selectedQueues, "extension"),
            date_range: {
                start: date_range.start.format('YYYY-MM-DD 00:00:00'),
                end: date_range.end ? date_range.end.format('YYYY-MM-DD 23:59:59'): null
            },
            hour_range: {
                start: parseInt(hour_range.start, 10),
                end: parseInt(hour_range.end, 10)
            },
            filter: formatMSecondsToTime(exclude_interval * 1000)
        };
    }

    generateReport() {
        const filters = this.getFilters();

        if (!filters) {
            alert("Please fill all the fields");
            return; // The getFilters method will handle the alert
        }
        this.setState({ loading: true });
        this.props.loadQueueStatistics(filters, () => {
            this.setState({ loading: false });
        });
    }

    render() {
        return (
            <CardBody>
                {/* <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Queue</Label>
                            <Input placeholder="ex: 800" value={this.state.queue} onChange={(e => this.setState({ queue: e.target.value }))} />
                        </FormGroup>
                    </Col>
                </Row> */}
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
                            {this.props.queues ? <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allQueues} onChange={() => this.setState({ allQueues: !this.state.allQueues })} type="checkbox" />{' '}
                                    Select all Queues
                                </Label>
                            </FormGroup> : ""}
                        </FormGroup>
                    </Col>
                </Row>
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
                    <Col className="mb-3">
                        <Label htmlFor="name">Time Range</Label>
                        <div className="rounded bg-light p-3">
                            <Row>
                                <Col>
                                    <TimeRangeSlider
                                        disabled={false}
                                        draggableTrack={true}
                                        format={24}
                                        maxValue={"24:00"}
                                        minValue={"00:00"}
                                        name={"time_range"}
                                        onChange={(time) => this.setState({
                                            hour_range: time
                                        })}
                                        step={60}
                                        value={this.state.hour_range} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <small>
                                        {this.state.hour_range.start}
                                    </small>
                                </Col>
                                <Col className="text-right">
                                    <small>
                                        {this.state.hour_range.end}
                                    </small>
                                </Col>
                            </Row>
                        </div>
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
                    <Col xs="2">
                        <ReportScheduleButton
                            api={"getCallQueueStatisticsSLA"}
                            data={this.getFilters()}
                        />
                    </Col>
                    <Col xs="10" className="text-right">
                        <Button disabled={this.state.loading} onClick={() => this.generateReport()} color="primary">
                            {this.state.loading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""}  Generate Report
                        </Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ configurations, metadata, queues }) {
    return {
        configurations,
        metadata,
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadQueueStatistics,
        listQueues
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateGroup));