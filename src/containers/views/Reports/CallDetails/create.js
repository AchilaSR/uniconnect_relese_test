import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCallDetails } from '../../../../actions/reports';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import { listQueues } from '../../../../actions/configurations';
import Select from 'react-select';
import _ from 'lodash';

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
            }
        };
    }

    componentWillMount() {
        this.props.listQueues();
    }

    generateReport() {
        if (this.state.queue) {
            this.props.getCallDetails({
                queue: _.map(this.state.queue, "extension"),
                start_time: this.state.date_range.start.format('YYYY-MM-DD 00:00:00'),
                end_time: this.state.date_range.end.format('YYYY-MM-DD 23:59:59')
            })
        } else {
            alert("Please fill all the feilds");
            return;
        }
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
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.generateReport()} color="primary">Generate Report</Button>
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
        getCallDetails,
        listQueues
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateGroup));