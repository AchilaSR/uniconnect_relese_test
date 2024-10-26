import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index as listNotes } from '../action';
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import moment from 'moment';
import CategoryPicker from './CategoryPicker';
import { checkPermission } from '../../../config/util';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';
import { loadAgents } from '../../../actions/reports';

class DispatchNoteFilter extends Component {
    constructor(props) {
        super(props);


        this.state = {
            endtime: moment().endOf('day').toDate(),
            starttime: moment().subtract(12, 'hour').startOf('day').toDate(),
            loading: false,
            filters: [],
            filtered_logs: [],
            extension: [],
            phone: "",
            agent: "",
            hasReadAccess: false
        };
    }

    componentWillMount() {
        this.props.loadAgents();
        this.generateReport();
        this.setState({ hasReadAccess: checkPermission('Disposition Management', 'READ') });
    }

    generateReport() {
        this.setState({ loading: true });
        this.props.listNotes({
            startTime: this.state.starttime,
            endTime: this.state.endtime
        }, (loading) => {
            if (!loading) {
                this.setState({ loading: false });
                this.filterReport();
            }
        });
    }


    filterReport() {
        const filtered_logs = [];
        if (this.props.disposition_notes) {
            this.props.disposition_notes.map((note) => {
                let valid = true;

                if (this.state.extension && this.state.extension.length > 0) {
                    if (_.filter(this.state.extension, { AgentExtension: note.agent_extension }).length === 0) {
                        valid = false;
                    }
                }

                if (this.state.phone && note.customer_number.indexOf(this.state.phone) === -1) {
                    valid = false;
                }

                if (this.state.agent && note.agent_name.indexOf(this.state.agent) === -1) {
                    valid = false;
                }

                if (this.state.category && note.category !== this.state.category.note_data) {
                    valid = false;
                }

                if (this.state.sub_category && note.sub_category !== this.state.sub_category.name) {
                    valid = false;
                }

                if (this.state.sub_sub_category && note.sub_sub_category !== this.state.sub_sub_category.name) {
                    valid = false;
                }

                if (valid) {
                    filtered_logs.push(note);
                }
                // console.log(filtered_logs)
                // console.log(note)
            })
        }

        this.setState({ filtered_logs }, () => {
            this.props.onFiltered(this.state.filtered_logs);
        })
    }

    render() {
        const { disposition_notes, agents } = this.props;

        return (
            <Card style={{ flexShrink: 0, width: 300 }}>
                <CardHeader>Report Settings</CardHeader>
                <CardBody className="scrollable-card">
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
                        <Col className="text-right">
                            <Button onClick={() => this.generateReport()} color="primary">{this.state.loading && <i className="fa fa-spin fa-circle-o-notch " />} Search</Button>
                        </Col>
                    </Row>
                    {disposition_notes && disposition_notes.length > 0 ? <div>
                        <hr />
                        <Row>
                            <Col>
                                {
                                    <Alert color="info"><b>{this.state.filtered_logs.length}</b> records out of <b>{disposition_notes.length}</b> filtered</Alert>
                                }
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
                        {this.state.hasReadAccess ? <div>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="name">Extensions</Label>
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
                        </div> : ""}
                        {/* {DYNAMIC_DISPOSITION_FORMS ? "" : <Row>
                            <Col>
                                <CategoryPicker disposition_categories={this.props.disposition_categories} onChange={(data) => this.setState(data)} />
                            </Col>
                        </Row>} */}
                        <Row>
                            <Col className="text-right">
                                <Button onClick={() => this.filterReport()} color="primary">Filter</Button>
                            </Col>
                        </Row>
                    </div> : ""}
                </CardBody >
            </Card >
        );
    }
}

function mapStateToProps({ agents, disposition_notes, disposition_categories }) {
    return {
        agents,
        disposition_notes,
        disposition_categories
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgents,
        listNotes
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(DispatchNoteFilter));