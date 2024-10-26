import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field_id: null,
            field_label: "",
            field_type: "TEXT",
            field_size: 100,
            field_default_value: "",
            field_visibility: 1,
            show_in_list_view: 1,
            is_mandatory: 0
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            const { data } = this.props;
            this.setState(data);
        }
    }

    save(e) {
        e.preventDefault();
        this.props.create(this.state, (err) => {
            if (!err) {
                this.clearForm();
            }
        });
        return false;
    }

    clearForm() {
        this.setState({
            field_id: null,
            field_label: "",
            field_type: "TEXT",
            field_size: 100,
            field_default_value: "",
            field_visibility: 1,
            show_in_list_view: 1,
            is_mandatory: 0
        }, this.props.onCancel());
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Label</Label>
                                <Input readOnly={this.state.field_id} type="text" placeholder="ex: Full name" value={this.state.field_label} onChange={(e) => this.setState({ field_label: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Field Size</Label>
                                <Input type="number" placeholder="ex: 100" value={this.state.field_size} onChange={(e) => this.setState({ field_size: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Default Value</Label>
                                <Input type="text" placeholder="ex: John Doe" value={this.state.field_default_value} onChange={(e) => this.setState({ field_default_value: e.target.value })} required={this.state.is_mandatory} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <div>
                                    <CustomInput id="field_visibility" onChange={() => this.setState(!this.state.field_visibility ? { field_visibility: 1 } : { show_in_list_view: 0, field_visibility: 0 })} checked={this.state.field_visibility} type="checkbox" label="Is visible" />
                                    <CustomInput id="show_in_list_view" disabled={!this.state.field_visibility} onChange={() => this.setState({ show_in_list_view: !this.state.show_in_list_view && this.state.field_visibility ? 1 : 0 })} checked={this.state.show_in_list_view && this.state.field_visibility} type="checkbox" label="Show in list view" />
                                    {/* <CustomInput id="is_mandatory" onChange={() => this.setState({ is_mandatory: !this.state.is_mandatory ? 1 : 0 })} checked={this.state.is_mandatory} type="checkbox" label="Is mandatory" /> */}
                                </div>
                            </FormGroup>
                        </Col>
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