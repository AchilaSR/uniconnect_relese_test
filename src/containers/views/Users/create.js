import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import history from '../../../history';
import { createUser, updateUser, setMobileSettings, setOutboundID } from '../../../actions/users';
import { listExtensions } from '../../../actions/configurations';
import { LOCAL_PHONE_REGEX } from '../../../config/globals';
import { logout } from '../../../actions';

class CreateUser extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentWillMount() {
        this.init();
    }

    componentDidUpdate() {
        if (this.props.user.login_id && this.state.login_id !== this.props.user.login_id) {
            this.init();
        }
    }

    init() {
        const { groups, roles, own, outbound_ids } = this.props;

        this.setState({
            ...this.state,
            ...this.props.user,
            outbound_cli: this.props.user.outboundservice ? _.find(outbound_ids, { id: this.props.user.outboundservice.id }) : ""
        })

        if (!own) {
            this.setState({
                group: _.find(groups, { group_id: this.props.user.group_id }),
                role: _.find(roles, { role_id: this.props.user.login_role_id }),
            });
        }
    }

    clearForm() {
        this.props.onClose();
    }

    saveData(e) {
        e.preventDefault();
        const self = this;

        if (this.props.own) {
            Promise.all([
                new Promise((resolve, reject) => {
                    if (this.state.mobile_number || this.state.ringmymobile) {
                        if (LOCAL_PHONE_REGEX.test(this.state.mobile_number)) {

                            const editData = {
                                extension: this.state.extension,
                                mobile_number: this.state.mobile_number,
                                ringmymobile: this.state.ringmymobile
                            }
                            this.props.setMobileSettings(editData, (err) => {
                                if (!err) {
                                    resolve(true);
                                }
                                else {
                                    reject(err);
                                }
                            });
                        } else {
                            window.alert("Please enter a valid phone number");
                            reject();
                        }
                    } else {
                        const editData = {
                            extension: this.state.extension,
                            mobile_number: "",
                            ringmymobile: false
                        }
                        this.props.setMobileSettings(editData, (err) => {
                            if (!err) {
                                resolve(true);
                            }
                            else {
                                reject(err);
                            }
                        });
                    }
                }),
                new Promise((resolve, reject) => {
                    if (this.state.outbound_cli) {
                        if ((!self.props.user.outboundservice && this.state.outbound_cli) ||
                            (self.props.user.outboundservice && !this.state.outbound_cli) ||
                            self.props.user.outboundservice && this.state.outbound_cli && self.props.user.outboundservice.id !== this.state.outbound_cli.id) {
                            this.props.setOutboundID({ outbound_cli: this.state.outbound_cli }, (err) => {
                                if (!err) {
                                    resolve(true)
                                } else {
                                    reject(err);
                                }
                            });
                        } else {
                            resolve(false);
                        }
                    }
                }),
            ]).then(([mobileChanged, needLogin]) => {
                self.clearForm();
                if (needLogin) {
                    if (window.confirm("System re-login required. Please confirm to proceed.")) {
                        self.props.logout(() => {
                            history.push("/");
                        });
                    }
                }
            }).catch((err) => {
                console.log("Error saving profile", err);
            });
        } else {
            const self = this;
            const editData = {
                login_id: this.state.login_id,
                login_role_id: this.state.role.role_id,
                work_group_id: this.state.group.group_id,
                extension_id: this.state.extension_id
            }
            this.props.updateUser(editData, (err) => {
                if (!err) {
                    self.clearForm();
                }
            });
        }
    }

    changeMobile(e) {
        this.setState({ mobile_number: e.target.value });

        if (!e.target.value) {
            this.setState({ ringmymobile: false })
        }
    }

    render() {

        const { roles, groups, own, outbound_ids } = this.props;

        return (
            <form onSubmit={(e) => this.saveData(e)} >
                <CardBody>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="first_name">First Name</Label>
                                <Input readOnly type="text" value={this.state.first_name} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input type="text" value={this.state.last_name} readOnly />
                            </FormGroup>
                        </Col>
                    </Row>
                    {own ?
                        <div>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="first_name">Mobile Number</Label>
                                        <Input type="text" onChange={(e) => this.changeMobile(e)} value={this.state.mobile_number} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {outbound_ids ?
                                <Row>
                                    <Col xs="12">
                                        <FormGroup>
                                            <Label htmlFor="first_name">Service</Label>
                                            <Select
                                                name="form-field-name2"
                                                value={this.state.outbound_cli}
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: "9999 !important" }) }}
                                                options={outbound_ids}
                                                getOptionValue={option => option['cli']}
                                                getOptionLabel={option => option['service_name']}
                                                onChange={(e) => this.setState({ outbound_cli: e })}
                                            // isClearable={true}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row> : ""}
                            <Row>
                                <Col xs="12">
                                    <FormGroup check>
                                        <Label check>
                                            <Input disabled={!this.state.mobile_number} checked={this.state.ringmymobile} onChange={() => this.setState({ ringmymobile: !this.state.ringmymobile })} type="checkbox" />{' '}Ring my mobile simultaneously</Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                        :
                        <div>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="login_username">Username</Label>
                                        <Input readOnly type="text" value={this.state.login_username} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="login_username">Extension</Label>
                                        <Input type="text" readOnly value={this.state.extension} />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            name="form-field-name2"
                                            value={this.state.role}
                                            options={roles}
                                            onChange={(e) => this.setState({ role: e })}
                                            getOptionValue={option => option['role_id']}
                                            getOptionLabel={option => option['name']}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs="12">
                                    <FormGroup>
                                        <Label htmlFor="name">Group</Label>
                                        <Select
                                            name="form-field-name2"
                                            value={this.state.group}
                                            options={groups}
                                            onChange={(e) => this.setState({ group: e })}
                                            getOptionValue={option => option['group_id']}
                                            getOptionLabel={option => option['group_name']}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>}
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Save</Button>{' '}
                            <Button onClick={() => this.clearForm()} color="danger">Cancel</Button>
                        </Col>
                    </Row>
                </CardBody>
            </form>
        );
    }
}

function mapStateToProps({ roles, groups, outbound_ids }) {
    return {
        roles, groups, outbound_ids
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listExtensions,
        createUser,
        logout,
        updateUser,
        setMobileSettings,
        setOutboundID
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateUser));
