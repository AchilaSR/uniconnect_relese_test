
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, send } from '../action';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { formatDateTime, removeNonAscii } from '../../../config/util';
import { listCategories } from '../../disposition/action';

class AddDisposionNote extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "",
            template: "",
            messageDate: "",
            cursorPosition: 0,
            class: "",
            code:"",
            type:"",
            category:"",
            catagories: []
        };
    }

    componentDidMount() {
        this.props.listTemplates(this.props.queue);

        this.props.listCategories(this.props.queue, (catagories) => {
            this.setState({ catagories })
        });
    }

    handleReminderDateChange(date) {
        this.setState({
            due_on: date
        });
    }

    save() {
        const self = this;

        const filteredData = {};
        for (const key in this.props.customer) {
            if (key.startsWith("cf_") && this.props.customer[key] !== "") {
                filteredData[key.substring(3)] = this.props.customer[key];
            }
        }
        
        this.props.send({
            "customer_id": this.props.customer.id,
            "desposition": removeNonAscii(this.state.message),
            "disposition_id": this.state.template.id,
            "customer_number": this.props.customer.number,
            "campaign": "["+ this.props.customer.campaign_id +"] "+ this.props.customer.campaign_name,
            "disposition_class": this.state.class,
            "disposition_code": this.state.code,
            "disposition_type": this.state.type,
            "category": this.state.category,
            "campaignId": this.props.customer.campaign_id,
            "lead_details": filteredData
        }, () => {
            if (self.props.onSuccess) {
                self.props.onSuccess();
            }
        });
    }

    selectTemplate(template) {
        console.log(template)
        this.setState({ "message": template.note_description, template, class: template.disposition_class, code: template.disposition_code, type: template.disposition_type, category: template.note_data  });
    }

    addDateToMessage() {
        const { message, cursorPosition } = this.state;
        this.setState({ "message": [message.slice(0, cursorPosition).trim(), formatDateTime(this.state.messageDate), message.slice(cursorPosition).trim()].join(' ').trim() });
    }

    render() {
        const { disposition_templates } = this.props;
        const { category, sub_category, sub_sub_category, catagories } = this.state;

        console.log(this.props);

        return (
            <div>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Message</label>
                            {catagories &&
                                <Select
                                    name="form-field-name2"
                                    value={this.state.template}
                                    options={catagories}
                                    onChange={(e) => this.selectTemplate(e)}
                                    placeholder="Choose a Template"
                                    className="mb-2"
                                    getOptionValue={option => option['note_data']}
                                    getOptionLabel={option => option['note_description']}
                                />}
                            <Input placeholder="Note" type="textarea" value={this.state.message}
                                onChange={(e) => this.setState({ message: e.target.value, cursorPosition: e.target.selectionStart })}
                                onKeyUp={(e) => this.setState({ cursorPosition: e.target.selectionStart })}
                                onClick={(e) => this.setState({ cursorPosition: e.target.selectionStart })}
                                rows="5" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
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
                            <Button className="ml-auto" disabled={!this.state.message.trim() || !this.state.template} onClick={() => this.save()} color="primary">Add Note</Button>
                        </div>
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
        listCategories
    }, dispatch);
}

function mapStateToProps({ disposition_templates, disposition_categories }) {
    return {
        disposition_templates, disposition_categories
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AddDisposionNote);
