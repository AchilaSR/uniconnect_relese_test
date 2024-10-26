import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ""
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
        this.setState({ message: "" });
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Message</Label>
                                <Input rows="5" type="textarea" placeholder="Enter the message content" value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} required />
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