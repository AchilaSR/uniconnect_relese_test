import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input, CustomInput, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { SMS_TYPES } from '../config';
import Select from 'react-select';

class LocationFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            endtime: null,
            starttime: null,
            type: [],
            filtered_logs: [],
            extension: "",
            tag: ""
        };
    }

    componentDidMount() {

        this.setState({ filtered_logs: _.orderBy(this.props.user_locations, ['sent_on'], ['desc']) }, () => {
            this.props.onFiltered(this.state.filtered_logs);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user_locations !== this.props.user_locations) {
            console.log(this.state.user_locations);

            this.setState({ filtered_logs: _.orderBy(this.props.user_locations, ['sent_on'], ['desc']) }, () => {
                this.props.onFiltered(this.state.filtered_logs);
            })
        }
    }

    changeStatus(key) {
        const i = this.state.type.indexOf(key);
        if (i > -1) {
            const type = this.state.type;
            type.splice(i, 1);
            this.setState({ type });
        } else {
            this.setState({ type: [key, ...this.state.type] });
        }
    }

    filterReport() {
        const filtered_logs = [];

        this.props.user_locations.map((item) => {
            let valid = true;

            if (this.state.phone && item.customer_number.indexOf(this.state.phone) === -1) {
                valid = false;
            }

            if (this.state.tag) {
                if (item.tag && item.tag.toLowerCase().replace(/\W/g, '').indexOf(this.state.tag.toLowerCase().replace(/\W/g, '')) === -1) {
                    valid = false;
                } else if (!item.tag) {
                    valid = false;
                }
            }

            if (this.state.type.length > 0 && this.state.type.indexOf(item.type) === -1) {
                valid = false;
            }

            if (this.state.extension && _.filter(this.state.extension, { AgentExtension: item.agent_extension }).length === 0) {
                valid = false;
            }

            if (this.state.starttime > 0 && moment(this.state.starttime).isAfter(item.sent_on)) {
                valid = false;
            }

            if (this.state.endtime > 0 && moment(this.state.endtime).isBefore(item.sent_on)) {
                valid = false;
            }

            if (valid) {
                filtered_logs.push(item);
            }
        })

        this.setState({ filtered_logs: _.orderBy(filtered_logs, ['sent_on'], ['desc']) }, () => {
            this.props.onFiltered(this.state.filtered_logs);
        })
    }

    render() {
        const { user_locations, agents } = this.props;

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
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Tag</Label>
                                <Input value={this.state.tag} onChange={(e) => this.setState({ tag: e.target.value })} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Agents</Label>
                                <Select
                                    value={this.state.extension}
                                    options={agents}
                                    onChange={(e) => this.setState({ extension: e })}
                                    isMulti={true}
                                    getOptionValue={option => option['AgentExtension']}
                                    getOptionLabel={option => option['AgentName']}
                                    className="multi-select"
                                    isClearable={true}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label for="exampleCheckbox">Type</Label>
                                <div>
                                    {
                                        Object.keys(SMS_TYPES).map((key) => <CustomInput id={key} key={key} onChange={() => this.changeStatus(key)} checked={this.state.type.indexOf(key) > -1} type="checkbox" label={SMS_TYPES[key].text} />)
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

function mapStateToProps({ agents }) {
    return {
        agents
    };
}


export default (connect(mapStateToProps, null)(LocationFilter));