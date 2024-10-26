import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disposition_class: "",
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
            disposition_class: "",
        });
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Class</Label>
                                <Input type="text" placeholder="Enter the Class Name" value={this.state.disposition_class} onChange={(e) => this.setState({ disposition_class: e.target.value })} required />
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

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(Create));