import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Label, Input, Form, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changePassword, checkCurrentPassword } from '../action';
import { CUSTOM } from '../../../custom';

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.toggleModel = this.toggleModel.bind(this);
        this.state = {
            password: "",
            confirm: ""
        }
    }

    toggleModel() {
        this.props.toggle();
    }

    changePassword(e) {
        e.preventDefault();

        if (!(new RegExp(CUSTOM.PASSWORD_POLICY ? CUSTOM.PASSWORD_POLICY.regex : '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$').test(this.state.password))) {
            alert("Password must meet the specified criteria");
            return;
        }

        if (this.state.password !== this.state.confirm) {
            alert("Password and Confirm Password are not matching");
            return;
        }

        this.props.changePassword(this.state.password, (err) => {
            if (!err) {
                this.setState({
                    password: "",
                    confirm: ""
                });
                this.toggleModel()
            }
        });
    }

    render() {
        console.log();
        return (
            <Modal size="md" isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                <ModalHeader toggle={this.toggleModel}>Change Password</ModalHeader>
                <ModalBody style={{ maxHeight: 500 }}>
                    <Form className='p-3' onSubmit={(e) => this.changePassword(e)}>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label htmlFor="login_username">New Password</Label>
                                    <Input required type="password" onChange={(e) => this.setState({ password: e.target.value })} value={this.state.password} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label htmlFor="login_username">Confirm Password</Label>
                                    <Input type="password" onChange={(e) => this.setState({ confirm: e.target.value })} value={this.state.confirm} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                Password should contain:
                                {
                                    CUSTOM.PASSWORD_POLICY ?
                                        <ul>{CUSTOM.PASSWORD_POLICY.rules.map((rule, index) => (<li key={index}>{rule}</li>))}</ul> :
                                        <ul>
                                            <li>At least one letter.</li>
                                            <li>At least one digit.</li>
                                            <li>At least one special character from the set @$!%*#?&.</li>
                                            <li>Minimum length of 8 characters.</li>
                                        </ul>}
                            </Col>
                        </Row>
                        <Button type='submit'>Save</Button>
                    </Form>
                </ModalBody>
            </Modal>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changePassword,
        checkCurrentPassword
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(ChangePassword));
