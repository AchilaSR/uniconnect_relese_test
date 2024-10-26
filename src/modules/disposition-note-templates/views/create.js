import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            note_data: "",
            note_description: ""
        };
    }

    save(e) {
        e.preventDefault();
        this.props.create(this.state, (err)=>{
            if(!err){
                this.clearForm();
            }
        });
        return false;
    }

    clearForm() {
        this.setState({
            note_data: "",
            note_description: ""
        });
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Note Type</Label>
                                <Input type="text" placeholder="Enter the note data" value={this.state.note_data} onChange={(e) => this.setState({ note_data: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Note Value</Label>
                                <Input rows="5" type="textarea" placeholder="Enter the note description" value={this.state.note_description} onChange={(e) => this.setState({ note_description: e.target.value })} required />
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