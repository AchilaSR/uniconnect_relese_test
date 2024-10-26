
import React, { Component } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, send } from '../action';
import { index as getDispositionPlans } from '../../disposition-form-mapping/action';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import Loader from '../../../components/Loader';
import { HANDLING_TIME_MAX, HANDLING_TIME_SEC, LEAD_STATUS, LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';
import { formatDuration } from '../../../config/util';
import { send as updateInboundDispostion } from '../../disposition/action';
import { followUp } from '../../../actions/facilities';
import moment from 'moment';
import Select from 'react-select';
import { setMinutes, setHours, isToday, setSeconds } from "date-fns";
import { create as addToDnc } from '../../dnc/action';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { loadAgents } from '../../../actions/reports';

class AddDisposionNote extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "",
            template: "",
            messageDate: "",
            cursorPosition: 0,
            value: {},
            timer: 0,
            due_on: setSeconds(setHours(setMinutes(new Date(), 0), new Date().getHours() + 1), 0),
            dnc_list: false
        };
    }

    componentDidMount() {
        this.props.listTemplates();
        this.props.loadAgents();
        this.props.getDispositionPlans();
        this.dispositionTimer = setInterval(() => {
            this.setState({ timer: this.state.timer + 1 });
        }, 1000)
    }

    componentDidUpdate() {
        // console.log("sate", this.state.messageDate)
    }

    componentWillUnmount() {
        clearInterval(this.dispositionTimer);
    }

    handleReminderDateChange(date) {
        this.setState({
            due_on: date
        });
    }

    save() {
        const self = this;
        const disposition_data = [];
        let followup_note = [];
        let followup_date = "";
        let notify = false;

        Object.keys(self.state.value).forEach(element => {
            if (["dnc", "followup_to_team", "followup_date", "teamMember"].indexOf(element) === -1) {
                disposition_data.push([element, self.state.value[element]]);
                followup_note.push(`${element}: ${self.state.value[element]}`);
            } else if ("teamMember" === element) {
                const assignee = _.find(this.props.agents, { AgentExtension: self.state.value[element] })
                disposition_data.push(["Assignee", `${assignee.AgentName} (${assignee.AgentExtension})`]);
            } else if ("followup_date" === element) {
                followup_date = moment(self.state.value[element]).format("YYYY-MM-DD HH:mm:ss");
            }
        });

        if (this.props.customerData) {
            Object.keys(this.props.customerData).forEach(element => {
                disposition_data.push([element, this.props.customerData[element]]);
            });
        }

        if(followup_date){
            disposition_data.push(["Followup Date", followup_date])
        }

        if (this.props.followup && !this.state.value.followup_date) {
            window.alert("Please select the follow-up date");
            return;
        }

        self.setState({ loading: true });

        if (disposition_data.length > 0) {
            if (this.props.inbound) {
                this.props.updateInboundDispostion({
                    "customer_number": this.props.customer_number,
                    "handling_time": this.state.timer,
                    "disposition_data": { data: disposition_data },
                    "exceeded_time": HANDLING_TIME_SEC > this.state.timer ? 0 : this.state.timer - HANDLING_TIME_SEC
                }, () => {
                    self.setState({ loading: false });
                    self.props.onSuccess();
                })
            } else {
                const filteredData = {};
                for (const key in this.props.customer) {
                    if (key.startsWith("cf_") && this.props.customer[key] !== "") {
                        filteredData[key.substring(3)] = this.props.customer[key];
                    }
                }
                this.props.send({
                    "lead_id": this.props.customer.id,
                    "number": (this.props.customer_number || this.props.customer.number).substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
                    "lead_status": LEAD_STATUS ? this.state.value["Lead Status"] : undefined,
                    "disposition_data": { data: disposition_data },
                    "campaign": "[" + this.props.customer.campaign_id + "] " + this.props.customer.campaign_name,
                    "campaignId": this.props.customer.campaign_id,
                    "lead_details": filteredData
                }, () => {
                    self.setState({ loading: false });

                    if (self.props.onSuccess) {
                        self.props.onSuccess();
                    }
                });
            }
        } else {
            window.alert("Please fill the required fields");
            return;
        }

        if (this.state.value.followup_date && this.props.followup) {
            let assignee = null;

            if (this.state.value.Assignee === "Team") {
                assignee = true;
            }

            if (this.state.value.Assignee === "Team Member") {
                assignee = parseInt(this.state.value.teamMember);
                notify = true;
            }

            this.props.followUp(assignee, {
                id: this.state.template ? this.state.template.id : "1",
                number: (this.props.customer_number || this.props.customer.number).substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
                "customer_id": this.props.customer.id,
                "due_on": moment(this.state.value.followup_date).format("YYYY-MM-DD HH:mm:ss"),
                "note": followup_note.join("+++++++")
            }, () => { });

            if (notify && this.props.onNotify) {
                this.props.onNotify(_.find(this.props.agents, { AgentExtension: assignee.toString() }), `Follow Up Added\n----\n${disposition_data.map(a => a.join(": ")).join("\n")}`);
            }
        }

        if (self.state.value.dnc) {
            this.props.addToDnc([(this.props.customer_number || this.props.customer.number).substr(-1 * LOCAL_PHONE_NUMBER_LENTGH)], () => { });
        }
    }

    render() {
        const { disposition_forms, queue = "0", disposition_plans, inbound, agents } = this.props;


        if (!disposition_forms || !disposition_plans || !agents) {
            return <Loader />
        }

        let plan = _.find(disposition_plans, { queue_extension: queue });

        if (!plan) {
            plan = _.find(disposition_plans, { queue_extension: "0" });
        }

        if (!plan) {
            return <div>No disposition form configured for the queue {queue}.</div>
        }

        const tmp_form = _.find(disposition_forms, { id: plan.form_id })
        const form = structuredClone(tmp_form);

        if (!form.value.properties) {
            form.value.properties = {};
        }

        if (LEAD_STATUS && !this.props.inbound) {
            form.value.properties["Lead Status"] = {
                "type": "string",
                "title": "Lead Status",
                "enum": LEAD_STATUS,
                "default": LEAD_STATUS[0]
            }

            if (form.ui_schema["ui:order"]) {
                form.ui_schema["ui:order"].push("Lead Status");
            }
        }

        if (this.props.followup) {
            form.value.properties.followup_date = {
                "type": "number"
            };

            form.value.properties.Assignee = {
                "type": "string",
                "title": "Assign follow up to:",
                "enum": [
                    "Me",
                    "Team",
                    "Team Member"
                ],
                "default": "Me"
            }

            if (!form.ui_schema) {
                form.ui_schema = {};
            }

            if (!form.required) {
                form.required = [];
            }

            if (!form.value.dependencies) {
                form.value.dependencies = {};
            }

            form.required.push("Assignee");

            form.ui_schema.followup_date = {
                "ui:title": "Follow Up Date",
                "ui:widget": (props) => {
                    return <DatePicker
                        selected={props.value ? new Date(props.value) : null}
                        onChange={(e) => props.onChange(e.getTime())}
                        required={props.required}
                        showTimeSelect
                        minTime={isToday(props.value) ? new Date() : setHours(setMinutes(new Date(), 30), 8)}
                        maxTime={setHours(setMinutes(new Date(), 0), 18)}
                        minDate={new Date()}
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        className="form-control w-100"
                        placeholder="Reminder Time"
                        popperPlacement="bottom-end"
                    />
                }
            };

            form.ui_schema.Assignee = {
                'ui:widget': 'radio',
            };

            form.value.dependencies.Assignee = {
                "oneOf": [
                    {
                        "properties": {
                            "Assignee": {
                                "enum": [
                                    "Me"
                                ]
                            }
                        }
                    },
                    {
                        "properties": {
                            "Assignee": {
                                "enum": [
                                    "Team"
                                ]
                            }
                        }
                    },
                    {
                        "properties": {
                            "Assignee": {
                                "enum": [
                                    "Team Member"
                                ]
                            },
                            "teamMember": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "teamMember"
                        ]
                    }
                ]
            };

            form.ui_schema.teamMember = {
                "ui:title": "Select Team Member",
                "ui:widget": (props) => {
                    return <Select
                        value={_.find(agents, { AgentExtension: props.value })}
                        options={agents}
                        onChange={(e) => props.onChange(e.AgentExtension)}
                        isMulti={false}
                        getOptionValue={option => option['AgentExtension']}
                        getOptionLabel={option => `[${option['AgentExtension']}] ${option['AgentName']}`}
                        className="multi-select"
                    />
                }
            };

            if (form.ui_schema["ui:order"]) {
                form.ui_schema["ui:order"].push("followup_date");
                form.ui_schema["ui:order"].push("Assignee");
                form.ui_schema["ui:order"].push("teamMember");
            }
        } else {
            form.value.properties.dnc = {
                "type": "boolean",
                "title": "Add to DNC (Do Not Call) List"
            }

            if (form.ui_schema["ui:order"]) {
                form.ui_schema["ui:order"].push("dnc");
            }
        }

        return (
            <div>
                {
                    inbound ? <Row>
                        <Col>
                            <Alert className='text-center' color={this.state.timer > HANDLING_TIME_SEC ? 'danger' : 'info'}>
                                <b>{formatDuration(Math.abs(HANDLING_TIME_SEC - this.state.timer))}</b> {this.state.timer > HANDLING_TIME_SEC ? `exceeded. Auto close in ${Math.max(HANDLING_TIME_MAX - this.state.timer, 0)} seconds` : 'remaining'}
                            </Alert>
                        </Col>
                    </Row> : ""
                }
                <Row>
                    <Col>
                        <Form
                            // disabled={this.state.loading}
                            schema={form.value}
                            validator={validator}
                            uiSchema={form.ui_schema}
                            formData={this.state.value}
                            onChange={({ formData }) => this.setState({ value: formData })}
                            onSubmit={(data) => this.save(data)}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        send,
        listTemplates: index,
        getDispositionPlans,
        updateInboundDispostion,
        followUp,
        loadAgents,
        addToDnc
    }, dispatch);
}

function mapStateToProps({ disposition_forms, disposition_plans, agents }) {
    return {
        disposition_forms,
        disposition_plans,
        agents
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddDisposionNote);
