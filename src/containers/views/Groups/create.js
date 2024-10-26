import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createGroup, updateGroup } from '../../../actions/groups';

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            group_name: "",
            group_description: "",
            error_name: "",
            group_id: ""
        };
    }
    componentDidUpdate(prevProps, prevState) {

        if (prevProps.groupData !== this.props.groupData) {
            const { groupData } = this.props;            
            this.setState({ group_name: groupData.group_name, group_description: groupData.group_description, group_id: groupData.id, error_name: "" });
        }
    }
    clearForm() {
        this.setState({ group_id:"",group_name: "", group_description: "", error_name: "" });
    }
    saveGroup() {
        if (this.state.group_id !== "") {
            if (this.state.group_name !== "") {
                this.props.updateGroup(this.state);
                this.setState({ error_name: "" });
                this.clearForm();
            } else {
                this.setState({ error_name: "Group name Required" });
            }
        } else {
            if (this.state.group_name !== "") {
                this.props.createGroup(this.state);
                this.setState({ error_name: "" });
                this.clearForm();
            } else {
                this.setState({ error_name: "Group name Required" });
            }
        }
    }

    cancelBtn() {
        this.clearForm();
    }

    groupNameOnChange = (event) => {
        this.setState({ group_name: event.target.value });
    }
    groupDisOnChange = (event) => {
        this.setState({ group_description: event.target.value })
    }

    render() {        
        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="group_name" placeholder="Enter the name" value={this.state.group_name} onChange={this.groupNameOnChange} required />
                            {this.state.error_name ? <FormText color="danger">{this.state.error_name}</FormText> : ''}
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Description</Label>
                            <Input type="text" id="group_description" placeholder="Enter the description" value={this.state.group_description} onChange={this.groupDisOnChange} required />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.saveGroup()} color="primary">Save</Button>{' '}
                        <Button onClick={() => this.cancelBtn()} color="danger">Cancel</Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ groups }) {
    return {
        groups
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createGroup,
        updateGroup

    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateGroup));