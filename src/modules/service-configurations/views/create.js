import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Select from "react-select";
import { create } from '../action';
import Loader from '../../../components/Loader';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cli: "",
            service_name: ""
        };
    }

    save(e) {
        e.preventDefault();

        if(!this.state.service_name){
            alert("Please fill the service fields");
            return
        }

        const data = {
            "cli": this.state.cli,
            "service_name": this.state.service_name.display_name,
            "queue": this.state.service_name.extension,
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
            cli: "",
            service_name: ""
        });
    }

    render() {
        const { queues } = this.props;

        if (!queues) {
            return <Loader />;
        }

        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Service (Queue)</Label>
                                <Select
                                    value={this.state.service_name}
                                    options={this.props.queues}
                                    onChange={(e) => this.setState({ service_name: e })}
                                    getOptionValue={option => option['extension']}
                                    getOptionLabel={option => option['display_name']}
                                    className="multi-select"
                                    isClearable={true}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Outbound CLI</Label>
                                <Input type="text" placeholder="ex: 011XXXXXXX" value={this.state.cli} onChange={(e) => this.setState({ cli: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Add</Button>{' '}
                        </Col>
                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapStateToProps({ queues }) {
    return {
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Create));