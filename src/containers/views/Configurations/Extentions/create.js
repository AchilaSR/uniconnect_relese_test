import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createExtention } from '../../../../actions/configurations';

class CreateExtention extends Component {
    constructor(props) {
        super(props);
        this.state = {
            extension: "",
            error_name: "",
            extension_id: ""
        };
    }
    clearForm() {
        this.setState({ extension_id: "", extension: "", error_name: "" });
    }
    saveGroup() {
        if (this.state.extension !== "") {
            this.props.createExtention(this.state);
            this.setState({ error_name: "" });
            this.clearForm();
        } else {
            this.setState({ error_name: "Extension Required" });
        }
    }

    cancelBtn() {
        this.clearForm();
    }

    groupNameOnChange = (event) => {
        this.setState({ extension: event.target.value });
    }

    render() {    
        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="extension" placeholder="Enter the extension" value={this.state.extension} onChange={this.groupNameOnChange} required />
                            {this.state.error_name ? <FormText color="danger">{this.state.error_name}</FormText> : ''}
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

function mapStateToProps({ configurations }) {
    return {
        configurations
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createExtention

    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateExtention));