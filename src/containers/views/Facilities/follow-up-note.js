
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input } from 'reactstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { setMinutes, setHours, isToday, setSeconds } from "date-fns";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { followUp } from '../../../actions/facilities';
import { index } from '../../../modules/followup-note-templates/action';
import moment from 'moment';
import Select from 'react-select';
import { formatDateTime, removeNonAscii } from '../../../config/util';
import { DYNAMIC_DISPOSITION_FORMS, LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';


class AddFollowUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            due_on: setSeconds(setHours(setMinutes(new Date(), 0), new Date().getHours() + 1), 0),
            reminded: false,
            template: "",
            message: "",
            messageDate: "",
            cursorPosition: 0
        };
    }

    componentDidMount() {
        this.props.listTemplates(this.props.queue);
    }

    handleReminderDateChange(date) {
        this.setState({
            due_on: date
        });
    }

    save(team = false) {
        const self = this;
        self.setState({ reminded: true });

        if ((!DYNAMIC_DISPOSITION_FORMS && !this.state.template) || !this.state.due_on || !this.state.message) {
            alert("Please fill all the feilds");
            return;
        }
        
        this.props.followUp(team, {
            id: this.state.template ? this.state.template.id : "",
            "customer_id": this.props.customer_id,
            "number": this.props.customer_number.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
            "due_on": moment(this.state.due_on).format("YYYY-MM-DD HH:mm:ss"),
            "note": removeNonAscii(this.state.message)
        }, () => {
            self.setState({ due_on: null, reminded: false });
            if (self.props.onSuccess) {
                self.props.onSuccess();
            }
        });
    }

    selectTemplate(template) {
        this.setState({ "message": template.note_data, template });
    }

    addDateToMessage() {
        const { message, cursorPosition } = this.state;
        this.setState({ "message": [message.slice(0, cursorPosition).trim(), formatDateTime(this.state.messageDate), message.slice(cursorPosition).trim()].join(' ').trim() });
    }

    render() {
        const { followup_templates } = this.props;

        return (
            <div>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Reminder Date and Time</label>
                            <DatePicker
                                selected={this.state.due_on}
                                onChange={this.handleReminderDateChange.bind(this)}
                                showTimeSelect
                                minTime={isToday(this.state.due_on) ? new Date() : setHours(setMinutes(new Date(), 30), 8)}
                                maxTime={setHours(setMinutes(new Date(), 0), 18)}
                                minDate={new Date()}
                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                className="form-control w-100"
                                placeholder="Reminder Time"
                                popperPlacement="bottom-end"
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Follow Up Disposition</label>
                            {followup_templates && !DYNAMIC_DISPOSITION_FORMS &&
                                <Select
                                    name="form-field-name2"
                                    value={this.state.template}
                                    options={followup_templates}
                                    onChange={(e) => this.selectTemplate(e)}
                                    getOptionValue={option => option['id']}
                                    getOptionLabel={option => option['note_description']}
                                    placeholder="Choose a Template"
                                    className="mb-2"
                                />}
                            <Input placeholder="Note" type="textarea" value={this.state.message} onChange={(e) => this.setState({ message: e.target.value, cursorPosition: e.target.selectionStart })} onKeyUp={(e) => this.setState({ cursorPosition: e.target.selectionStart })} onClick={(e) => this.setState({ cursorPosition: e.target.selectionStart })} rows="5" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="d-flex">
                            <div>
                                <DatePicker
                                    selected={this.state.messageDate}
                                    onChange={(date) => this.setState({ messageDate: date })}
                                    showTimeSelect
                                    customInput={<Button><i className="fa fa-calendar"></i></Button>}
                                />
                            </div>
                            {this.state.messageDate ?
                                <Button className="ml-1" outline onClick={() => this.addDateToMessage()}><i className="fa fa-paste"></i> {formatDateTime(this.state.messageDate)}</Button> : ""}
                            <div className="ml-auto align-items-center d-flex d-grid gap-2">
                                <div className='mr-2'>Add Follow Up to</div>
                                <Button className='mr-2' style={{ width: 60 }} disabled={(!DYNAMIC_DISPOSITION_FORMS && !this.state.template) || !this.state.due_on || !this.state.message} onClick={() => this.save()} color="primary">Me</Button>
                                <Button style={{ width: 60 }} disabled={(!DYNAMIC_DISPOSITION_FORMS && !this.state.template) || !this.state.due_on || !this.state.message} onClick={() => this.save(true)} color="primary">Team</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        followUp,
        listTemplates: index
    }, dispatch);
}

function mapStateToProps({ followup_templates }) {
    return {
        followup_templates
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AddFollowUp);
