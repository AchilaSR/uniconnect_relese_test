import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';
import Loader from '../../../components/Loader';
import Select from 'react-select';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "disposition": "",
            "code": "",
            "disposition_class": "",
            "type": "",
            "category": "",
        };
    }

    save(e) {
        e.preventDefault();
        const data = {
            ...this.state,
            "disposition_class": this.state.disposition_class.value,
            "type": this.state.type.value,
            "category": this.state.category.id
        }

        this.props.create(data, (err) => {
            if (!err) {
                this.clearForm();
            }
        });
        return false;
    }

    clearForm() {
        this.setState({
            "disposition": "",
            "code": "",
            "disposition_class": "",
            "category": "",
            "type": ""
        });
    }

    render() {
        const { disposition_classes, disposition_types, disposition_categories } = this.props;

        if (!disposition_classes || !disposition_types || !disposition_categories) {
            return <Loader />;
        }

        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Code</Label>
                                <Input type="text" placeholder="Enter the Disposition Code" value={this.state.code} onChange={(e) => this.setState({ code: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Class</Label>
                                <Select
                                    name="form-field-name2"
                                    value={this.state.disposition_class}
                                    options={disposition_classes.map(t => { return { value: t.disposition_class, label: t.disposition_class } })}
                                    onChange={(e) => this.setState({ disposition_class: e })}
                                    placeholder="Choose a Class"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Type</Label>
                                <Select
                                    name="form-field-name2"
                                    value={this.state.type}
                                    options={disposition_types.map(t => { return { value: t, label: t } })}
                                    onChange={(e) => this.setState({ type: e })}
                                    placeholder="Choose a Class"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Category</Label>
                                <Select
                                    name="form-field-name2"
                                    value={this.state.category}
                                    options={disposition_categories}
                                    onChange={(e) => this.setState({ category: e })}
                                    getOptionValue={option => option['id']}
                                    getOptionLabel={option => option['name']}
                                    placeholder="Choose a Category"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Disposition</Label>
                                <Input rows="5" type="textarea" placeholder="Enter the disposition" value={this.state.disposition} onChange={(e) => this.setState({ disposition: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Add</Button>{' '}
                            {/* <Button onClick={() => this.clearForm()} color="danger">Cancel</Button> */}
                        </Col>
                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapStateToProps({ disposition_classes, disposition_types, disposition_categories }) {
    return {
        disposition_classes,
        disposition_types,
        disposition_categories
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Create));