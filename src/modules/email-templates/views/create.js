import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subject: "",
            body: ""
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
            subject: "",
            body: ""
        });
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Subject</Label>
                                <Input type="text" placeholder="Enter the email subject" value={this.state.subject} onChange={(e) => this.setState({ subject: e.target.value })} required />
                                {this.state.error_name ? <FormText color="danger">{this.state.error_name}</FormText> : ''}
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Body</Label>
                                <Input rows="5" type="textarea" placeholder="Enter the email body" value={this.state.body} onChange={(e) => this.setState({ body: e.target.value })} required />
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