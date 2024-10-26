import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            value: "",
            ui_schema: ""
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.data && this.props.data.id) {
            if (!prevProps.data || (prevProps.data && prevProps.data.id !== this.props.data.id)) {
                this.setState({
                    ...this.props.data,
                    value: JSON.stringify(this.props.data.value, null, 2),
                    ui_schema: JSON.stringify(this.props.data.ui_schema, null, 2)
                })
            }
        } else if (this.state.id) {
            this.state = {
                id: undefined,
                name: "",
                value: "",
                ui_schema
            };
        }
    }

    save(e) {
        e.preventDefault();

        const data = {
            name: this.state.name,
            value: JSON.parse(this.state.value),
            ui_schema: JSON.parse(this.state.ui_schema),
            id: this.state.id
        };

        this.props.create(data, (err) => {
            if (!err) {
                this.clearForm();
            }
        });
        return false;
    }

    clearForm() {
        this.setState({
            id: undefined,
            name: "",
            value: "",
            ui_schema: ""
        });
        this.props.onCancel();
    }

    getJson() {
        try {
            return JSON.parse(this.state.value);
        } catch (e) {
            return {}
        }
    }

    getSchema() {
        try {
            return JSON.parse(this.state.ui_schema);
        } catch (e) {
            return {}
        }
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Name</Label>
                                <Input type="text" placeholder="Enter a name to the Form" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="name">JSON Schema</Label>
                                <Input className='monospace' rows="20" type="textarea" placeholder="Enter the form schema in JSON format" value={this.state.value} onChange={(e) => this.setState({ value: e.target.value })} required />
                            </FormGroup>
                        </Col>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="name">UI Schema</Label>
                                <Input className='monospace' rows="20" type="textarea" placeholder="Enter the UI Schema in JSON format" value={this.state.ui_schema} onChange={(e) => this.setState({ ui_schema: e.target.value })} required />
                            </FormGroup>
                        </Col>
                        {this.state.value ?
                            <Col>
                                <div className='bg-light rounded px-3 pt-3 mb-3 preview'>
                                    <h6>Preview</h6>
                                    <hr />
                                    <Form
                                        schema={this.getJson()}
                                        uiSchema={this.getSchema()}
                                        validator={validator}
                                        onChange={console.log('changed')}
                                        onSubmit={console.log('submitted')}
                                        onError={console.log('errors')}
                                    />
                                </div>
                            </Col> : ""}
                    </Row>
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Save</Button>{' '}
                            <Button onClick={() => this.clearForm()} color="danger">Cancel</Button>
                        </Col>
                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(Create));