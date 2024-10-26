
import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, FormText, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createRole, updateRole } from '../../../actions/roles';
import _ from 'lodash';
import Select from "react-select";
import Loader from '../../../components/Loader';
import CheckBox from '../../../components/CheckBox';

class CreateRole extends Component {
    constructor(props) {
        super(props);
        this.state = {
            role_name: "",
            role_description: "",
            isDefault: false,
            role_id: "",
            rules: [],
            roleDataRules: []
        };
    }

    
    componentDidMount() {
        const { roleData } = this.props;
        const originalRules = roleData.rules || [];
        this.setState({
            rules: _.cloneDeep(originalRules),
            role_name: roleData.name || "",
            role_description: roleData.description || "",
            isDefault: roleData.isDefault,
            role_id: roleData.role_id || "",
            error_name: "",
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.roleData !== this.props.roleData) {
            const { roleData } = this.props;
            this.setState({ rules: roleData.rules, role_name: roleData.name, role_description: roleData.description, isDefault: roleData.isDefault || false, role_id: roleData.role_id, error_name: "" });
        }
    }

    clearForm() {
        // this.setState({ role_name: "", role_description: "",isDefault: false, error_name: "", rules: [] });
        this.props.clearForm();
    }

    saveRole() {
        const self = this;
        console.log("save")
        if (this.state.role_id) {
            this.props.updateRole(this.state, (err) => {
                if (!err) {
                    self.setState({ error_name: "" });
                    self.clearForm();
                }
            });
        } else {
            if (this.state.role_name) {
                this.props.createRole(this.state, (err) => {
                    if (!err) {
                        self.setState({ error_name: "" });
                        self.clearForm();
                    }
                });
            } else {
                this.setState({ error_name: "Role Name Required" });
            }
        }
    }

    cancelBtn() {
        this.clearForm();
    }

    roleNameOnChange = (event) => {
        this.setState({ role_name: event.target.value });
    }
    roleDisOnChange = (event) => {
        this.setState({ role_description: event.target.value })
    }
    isDefaultOnChange = (event) => {
        this.setState({
            isDefault: event
        })
    }

    isEditClicked() {
        if (this.state.roleDataRules.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    

    changePermission(rule, module, access) {
        let rules = _.clone(rule, true) || [];
        _.find(rules, ["module_id", module.module_id]) ? _.find(rules, ["module_id", module.module_id])[access] ? _.find(rules, ["module_id", module.module_id])[access] = false : _.find(rules, ["module_id", module.module_id])[access] = true : rules.push({ ...module, ...{ [access]: true } });
        this.setState({ rules });
    }

    checkPermission(module, type) {
        const { rules } = this.state;
        return _.find(rules, ["module_id", module]) && _.find(rules, ["module_id", module])[type];
    }

    render() {
        const { permissions } = this.props;
        const { rules } = this.state;

        const isDefault = [
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ];

        if (!permissions) {
            return <Loader />;
        }

        return (

            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Name</Label>
                            <Input  type="text" id="role_name" placeholder="Enter the name" value={this.state.role_name} onChange={this.roleNameOnChange} />
                            {this.state.error_name ? <FormText color="danger">{this.state.error_name}</FormText> : ''}
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Description</Label>
                            <Input type="text" id="role_description" placeholder="Enter the description" value={this.state.role_description} onChange={this.roleDisOnChange} required />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    {/* <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Is Default</Label>
                            <Select id="is_default" value={this.state.isDefault}
                          options={isDefault} onChange={this.isDefaultOnChange} required>
                            </Select>
                        </FormGroup>
                    </Col> */}

                </Row>
                <Row>
                    <Col>
                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th style={{ width: 60 }} className="text-center">Read</th>
                                    <th style={{ width: 60 }} className="text-center">Create</th>
                                    <th style={{ width: 60 }} className="text-center">Edit</th>
                                    <th style={{ width: 60 }} className="text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    permissions.map((p) => {
                                        return <tr key={p.module_id}>
                                            <td>{p.module_name}</td>
                                            {["readaccess", "writeaccess", "editaccess", "deleteaccess"].map((a) => <td className="text-center"><CheckBox selected={this.checkPermission(p.module_id, a)} onChange={() => this.changePermission(rules, p, a)} /></td>)}
                                        </tr>
                                    })
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.saveRole()} color="primary">Save</Button>{' '}
                        <Button onClick={() => this.cancelBtn()} color="danger">Cancel</Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ roles, permissions }) {
    return {
        roles, permissions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createRole,
        updateRole

    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateRole));
