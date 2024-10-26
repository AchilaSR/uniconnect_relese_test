
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, send } from '../action';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import _ from 'lodash';

class SendEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: "",
            body: "",
            template: "",
            to: [],
            cc: []
        };
    }

    componentDidMount() {
        this.setState({ to:  [{label: this.props.email,  value: this.props.email }] });
        this.props.listTemplates();
    }

    componentDidUpdate(prevProps) {
        // console.log(this.state.to)
        if (prevProps.email !== this.props.email) {
            this.setState({ to: [{label: this.props.email,  value: this.props.email }] });
        }
    }

    save() {
        const self = this;
        this.setState({ clicked: true });
        let emails = this.state.to

        emails.forEach(e=>{
            this.props.send({
                "to": e.value,
                "cc": _.map(this.state.cc, "value"),
                "subject": this.state.subject,
                "body": this.state.body
            })
        })
        this.setState({ clicked: false });
        if (self.props.onSuccess) {
            self.props.onSuccess();
        }
        // this.props.send({
        //     "to": this.state.to,
        //     "cc": _.map(this.state.cc, "value"),
        //     "subject": this.state.subject,
        //     "body": this.state.body
        // }, () => {
        //     this.setState({ clicked: false });
        //     if (self.props.onSuccess) {
        //         self.props.onSuccess();
        //     }
        // });
    }

    selectTemplate(template) {
        this.setState({ "body": template.value, subject: template.label, template });
    }

    render() {
        const { email_templates } = this.props;

        return (
            <div>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>To</label>
                            <CreatableSelect
                                isMulti
                                defaultValue={this.props.email ?  {label: this.props.email,  value: this.props.email  } : ""}
                                onChange={(e) => this.setState({ to: e})}
                            />
                            {/* <Input placeholder="Email" type="email" value={this.state.to} onChange={(e) => this.setState({ to: e.target.value })} /> */}
                        </FormGroup>
                        <FormGroup>
                            <label>CC</label>
                            <CreatableSelect
                                isMulti
                                value={this.state.cc}
                                onChange={(value) => this.setState({ cc: value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Message</label>
                            {email_templates &&
                                <Select
                                    name="form-field-name2"
                                    value={this.state.template}
                                    options={email_templates.map(t => { return { value: t.body, label: t.subject } })}
                                    onChange={(e) => this.selectTemplate(e)}
                                    placeholder="Choose a Template"
                                    className="mb-2"
                                />}
                            <Input placeholder="Subject" type="text" className="mb-2" value={this.state.subject} onChange={(e) => this.setState({ subject: e.target.value })} />
                            <Input placeholder="Body" type="textarea" value={this.state.body} onChange={(e) => this.setState({ body: e.target.value })} rows="10" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button disabled={!this.state.body.trim() || !this.state.subject.trim() || this.state.clicked} onClick={() => this.save()} color="primary">Send Mail</Button>{' '}
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

function mapStateToProps({ email_templates }) {
    return {
        email_templates
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(SendEmail);
