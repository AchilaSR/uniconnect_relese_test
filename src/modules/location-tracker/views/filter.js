import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input, CustomInput, Alert } from 'reactstrap';
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { STATUS_TEXTS } from '../config';

class LocationFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            endtime: null,
            starttime: null,
            status: [],
            filtered_logs: []
        };
    }

    componentDidMount() {
        this.setState({ filtered_logs: this.props.user_locations }, () => {
            this.props.onFiltered(this.state.filtered_logs);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user_locations !== this.props.user_locations) {
            console.log(this.state.user_locations);

            this.setState({ filtered_logs: this.props.user_locations }, () => {
                this.props.onFiltered(this.state.filtered_logs);
            })
        }
    }

    changeStatus(key) {
        const i = this.state.status.indexOf(parseInt(key));
        if (i > -1) {
            const status = this.state.status;
            status.splice(i, 1);
            this.setState({ status });
        } else {
            this.setState({ status: [parseInt(key), ...this.state.status] });
        }
    }

    filterReport() {
        const filtered_logs = [];

        this.props.user_locations.map((item) => {
            let valid = true;

            if (this.state.phone && item.msisdn.indexOf(this.state.phone) === -1) {
                valid = false;
            }

            if (this.state.status.length > 0 && this.state.status.indexOf(parseInt(item.status)) === -1) {
                valid = false;
            }

            if (this.state.starttime > 0 && moment(this.state.starttime).isAfter(item.updatedon)) {
                valid = false;
            }

            if (this.state.endtime > 0 && moment(this.state.endtime).isBefore(item.updatedon)) {
                valid = false;
            }

            if (valid) {
                filtered_logs.push(item);
            }
        })

        this.setState({ filtered_logs }, () => {
            this.props.onFiltered(this.state.filtered_logs);
        })
    }

    render() {
        const { user_locations } = this.props;

        return (
            <Card className="mr-3" style={{ flexShrink: 0, width: 300 }}>
                <CardHeader>Filter</CardHeader>
                <CardBody className="scrollable-card">
                    <Row>
                        <Col>
                            {
                                <Alert color="info"><b>{this.state.filtered_logs.length}</b> records out of <b>{user_locations.length}</b> filtered</Alert>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="ccnumber">Start Date and Time</Label>
                                <DatePicker
                                    selected={this.state.starttime}
                                    onChange={(starttime) => this.setState({ starttime })}
                                    showTimeSelect
                                    maxDate={new Date()}
                                    dateFormat="yyyy-MM-dd HH:mm:ss"
                                    className="form-control"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="ccnumber">End Date and Time</Label>
                                <DatePicker
                                    selected={this.state.endtime}
                                    onChange={(endtime) => this.setState({ endtime })}
                                    showTimeSelect
                                    minDate={this.state.starttime}
                                    maxDate={new Date()}
                                    dateFormat="yyyy-MM-dd HH:mm:ss"
                                    className="form-control"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Customer Number</Label>
                                <Input value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value })} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label for="exampleCheckbox">Status</Label>
                                <div>
                                    {
                                        Object.keys(STATUS_TEXTS).map((key) => <CustomInput id={key} key={key} onChange={() => this.changeStatus(key)} checked={this.state.status.indexOf(parseInt(key)) > -1} type="checkbox" label={STATUS_TEXTS[key].text} />)
                                    }
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="text-right">
                            <Button onClick={() => this.filterReport()} color="primary">Filter</Button>
                        </Col>
                    </Row>
                </CardBody >
            </Card >
        );
    }
}

export default LocationFilter;