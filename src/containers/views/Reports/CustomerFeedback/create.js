import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFeedbackList, getLanguageList } from '../../../../actions/feedback';
import Select from 'react-select';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import { loadAgents } from '../../../../actions/reports';
import { listQueues } from '../../../../actions/configurations';

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            extensions: [],
            hotlines: [],
            languages: [],
            feedbacks: [],
            allExtensions: false,
            allHotlines: false,
            allLanguages: true,
            allFeedbacks: false,
            start: moment(),
            end: moment(),
            customerNumber: ""
        };
    }

    componentWillMount() {
        this.props.getFeedbackList();
        this.props.getLanguageList();
    }


    generateReport() {
        let extensions = this.state.extensions;
        let hotlines = this.state.hotlines;
        let languages = this.state.languages;
        let feedbacks = this.state.feedbacks;

        if (this.state.allExtensions) {
            extensions = this.props.agents
        }

        if (this.state.allHotlines) {
            hotlines = this.props.queues
        }

        if (this.state.allLanguages) {
            languages = this.props.feedback_meta.languages
        }

        if (this.state.allFeedbacks) {
            feedbacks = this.props.feedback_meta.feedbacks
        }

        this.props.onSearch({
            extensions: extensions ? extensions.map((a) => a.AgentExtension) : [],
            languages: languages,
            feedbacks: feedbacks ? feedbacks: [],
            hotline_numbers: hotlines.map((a) => a.extension),
            customer_number: this.state.customerNumber ? this.state.customerNumber.slice(-9) : "",
            duration: {
                "startTime": this.state.start.format('YYYY-MM-DD 00:00:00'),
                "endTime": this.state.end.format('YYYY-MM-DD 23:59:59')
            }
        });
    }

    render() {
        return (
            <CardBody>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="ccnumber">Duration</Label>
                            <DateRangePicker
                                startDate={this.state.start}
                                startDateId="cs_startDate"
                                endDate={this.state.end}
                                endDateId="cs_endDate"
                                onDatesChange={({ startDate, endDate }) => this.setState({ start: startDate, end: endDate })}
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
                {/* <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Queues</Label>
                            <Select
                                value={this.state.hotlines}
                                options={this.props.queues}
                                onChange={(e) => this.setState({ hotlines: e })}
                                isMulti={true}
                                getOptionValue={option => option['extension']}
                                getOptionLabel={option => option['display_name']}
                                className="multi-select"
                                isClearable={true}
                                isDisabled={this.state.allHotlines}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allHotlines} onChange={() => this.setState({ allHotlines: !this.state.allHotlines })} type="checkbox" />{' '}
                                    Select all Queues
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row> */}
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
                                isDisabled={this.state.allExtensions}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allExtensions} onChange={() => this.setState({ allExtensions: !this.state.allExtensions })} type="checkbox" />{' '}
                                    Select all Agents
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                {/* <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Languages</Label>
                            <Select
                                value={this.state.languages}
                                options={this.props.feedback_meta.languages}
                                onChange={(e) => this.setState({ languages: e })}
                                isMulti={true}
                                getOptionValue={option => option}
                                getOptionLabel={option => option}
                                className="multi-select"
                                isDisabled={this.state.allLanguages}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allLanguages} onChange={() => this.setState({ allLanguages: !this.state.allLanguages })} type="checkbox" />{' '}
                                    Select all
                                            </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row> */}
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Customer Feedback</Label>
                            <Select
                                value={this.state.feedbacks}
                                options={this.props.feedback_meta.feedbacks}
                                onChange={(e) => this.setState({ feedbacks: e })}
                                isMulti={true}
                                getOptionValue={option => option}
                                getOptionLabel={option => option}
                                className="multi-select"
                                isDisabled={this.state.allFeedbacks}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allFeedbacks} onChange={() => this.setState({ allFeedbacks: !this.state.allFeedbacks })} type="checkbox" />{' '}
                                    Select all
                                </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="ccnumber">Customer Number</Label>
                            <Input type="text" id="matured-days" placeholder="Customer Number" value={this.state.customerNumber} onChange={(e) => this.setState({ customerNumber: e.target.value })} />
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

function mapStateToProps({ feedback_meta, agents,queues }) {
    return {
        feedback_meta,
        agents, 
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFeedbackList,
        getLanguageList,
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateGroup));