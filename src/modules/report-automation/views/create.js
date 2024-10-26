
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input, Label } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import 'react-dates/initialize';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { add, index } from '../action';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const frequencies = [
    { singular: "day", label: "Daily", value: "d" },
    { singular: "week", label: "Weekly", value: "w" },
    { singular: "month", label: "Monthly", value: "m" }
]

class CreateScheduledReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mails: [],
            schedule: null,
            range: null,
            frequency: frequencies[0],
            time: "08:00",
            day: null,
            week: null,
            month: null,
            cron: null,
            report_name: ""
        };
    }

    componentDidMount() {
        if (!this.props.schedule_reports)
            this.props.index();
    }

    save() {
        const [hour, min] = this.state.time.split(":");
        let day = "*";
        let week = "*";
        let month = "*";


        if (this.state.frequency.label === "Monthly") {
            day = this.state.day;
        }

        if (this.state.frequency.label === "Weekly") {
            week = this.state.week.value;
        }

        let cron = [min, hour, day, month, week].join(" ")

        const self = this;
        const mailstr = this.state.mails.map(a => a.label).join();

        console.log(this.props)

        this.props.add({
            "schedule": cron,
            "range": this.state.range.value,
            "frequency": this.state.frequency.value,
            "report_type": this.props.api,
            "report_filters": this.props.data,
            "emails": mailstr,
            "report_name": this.state.report_name
        }, () => {
            if (self.props.onSuccess) {
                self.props.onSuccess();
            }
        });
    }

    render() {
        const { schedule_reports, api } = this.props;

        const tmpEmails = [];

        if (schedule_reports) {
            schedule_reports.forEach(report => {
                report.emails.split(",").forEach((email) => {
                    tmpEmails.push(email)
                })
            });
        }

        const emails = [...new Set(tmpEmails)].map(a => ({ value: a, label: a }));

        return (
            <div>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Name</Label>
                            <Input required placeholder={`ex: ${_.startCase(api.replace("DialerCore/", "").replace("get", "").replace(".htm", ""))}`} value={this.state.report_name} onChange={(e) => { this.setState({ report_name: e.target.value }) }} type="text" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Frequency</Label>
                            <Select
                                value={this.state.frequency}
                                onChange={(e) => { this.setState({ frequency: e, range: -1 }) }}
                                options={frequencies}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                {this.state.frequency && (this.state.frequency.label === "Monthly") ?
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="name">Day of the month</Label>
                                <Input onChange={(e) => { this.setState({ day: e.target.value }) }} type="number" min="1" max="31" />
                            </FormGroup>
                        </Col>
                    </Row>
                    : ""
                }
                {this.state.frequency && (this.state.frequency.label === "Weekly") ?
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="name">Day of the week</Label>
                                <Select
                                    value={this.state.week}
                                    onChange={(e) => { this.setState({ week: e }) }}
                                    options={[
                                        { label: "Monday", value: "1" },
                                        { label: "Tuesday", value: "2" },
                                        { label: "Wednesday", value: "3" },
                                        { label: "Thursday", value: "4" },
                                        { label: "Friday", value: "5" },
                                        { label: "Saturday", value: "6" },
                                        { label: "Sunday", value: "7" }
                                    ]}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    : ""
                }
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Time</Label>
                            <Input value={this.state.time} onChange={(e) => { this.setState({ time: e.target.value }) }} type="time" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Range</Label>
                            <Select
                                value={this.state.range}
                                onChange={(e) => { this.setState({ range: e }) }}
                                options={[
                                    { label: `Previous ${this.state.frequency.singular}`, value: -1 },
                                    { label: `Current  ${this.state.frequency.singular}`, value: 0 },
                                ]}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label htmlFor="name">Mails</Label>
                            <CreatableSelect
                                isMulti
                                options={[...emails, ...this.state.mails]}
                                value={this.state.mails}
                                onChange={(e) => this.setState({ mails: e })}
                                onCreateOption={(inputValue) => {
                                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
                                        const newEmail = {
                                            value: inputValue,
                                            label: inputValue,
                                        };
                                        this.setState({ mails: [...this.state.mails, newEmail] });
                                    }
                                }}
                            />
                        </FormGroup>

                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.save()} color="primary">Submit</Button>{' '}
                    </Col>
                </Row>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        add,
        index
    }, dispatch);
}

function mapStateToProps({ schedule_reports }) {
    return {
        schedule_reports
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateScheduledReport);
