
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input, Label } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, send } from '../action';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

class SendSMS extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "",
            template: "",
            phone_number: [],
            numEdit: false
        };
    }

    componentDidMount() {
        this.setState([{ phone_number: this.props.phone_number }]);
        this.props.listTemplates();
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.phone_number !== this.props.phone_number) {
    //         this.setState({ phone_number: this.props.phone_number });
    //     }
    // }

    save() {
        const self = this;
        self.setState({ clicked: true });

        let numbers = this.state.phone_number;
        console.log(numbers)
        numbers.forEach(e => {
            this.props.send({
                "to": e.value,
                "message": this.state.message
            } )
        });

        self.setState({ clicked: false });
        if (self.props.onSuccess) {
            self.props.onSuccess();
        }
    }

    selectTemplate(template) {
        this.setState({ "message": template.value, template });
    }

    render() {
        const { sms_templates, contacts } = this.props;

        return (
            <div>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Phone Number</label>
                            {/* <Input placeholder="Phone Number" type="phone" value={this.state.phone_number} onChange={(e) => this.setState({ phone_number: e.target.value })} /> */}
                            <CreatableSelect
                                isMulti
                                value={this.state.phone_number}
                                options={contacts}
                                onChange={(e) => this.setState({ phone_number: e })}
                            />

                        </FormGroup>

                        <FormGroup>
                            <label>Message</label>
                            {sms_templates &&
                                <Select
                                    name="form-field-name2"
                                    value={this.state.template}
                                    options={sms_templates.map(t => { return { value: t.message, label: t.message } })}
                                    onChange={(e) => this.selectTemplate(e)}
                                    placeholder="Choose a Template"
                                    className="mb-2"
                                />}
                            <Input placeholder="Message" type="textarea" value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} rows="5" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button disabled={!this.state.message.trim() || this.state.clicked} onClick={() => this.save()} color="primary">Send Message</Button>{' '}
                    </Col>
                </Row>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        send,
        listTemplates: index
    }, dispatch);
}

function mapStateToProps({ sms_templates }) {
    return {
        sms_templates
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(SendSMS);
