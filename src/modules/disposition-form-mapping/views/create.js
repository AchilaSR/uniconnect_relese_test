import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Select from "react-select";
import { create } from '../action';
import Loader from '../../../components/Loader';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            plan_name: "",
            queue: null,
            dispositions: []
        };
    }

    save(e) {
        e.preventDefault();
        
        if(!this.state.queue ||  this.state.dispositions.length==0){
            alert("Please fill the empty fields")
            return
        }

        const data = {
            "plan_name": this.state.plan_name,
            "queue_extension": this.state.queue.extension,
            "disposition_ids": this.state.dispositions.id
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
            plan_name: "",
            queue: "",
            dispositions: []
        });
    }

    render() {
        const { disposition_forms, queues } = this.props;

        if (!disposition_forms || !queues) {
            return <Loader />;
        }

        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Queue</Label>
                                <Select
                                    value={this.state.queue}
                                    options={[{ extension: 0, display_name: "Default" }, ...this.props.queues]}
                                    onChange={(e) => this.setState({ queue: e })}
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
                                <Label htmlFor="name">Disposition Form Template</Label>
                                <Select
                                    name="form-field-name2"
                                    value={this.state.dispositions}
                                    isMulti={false}
                                    options={disposition_forms}
                                    getOptionValue={option => option['id']}
                                    getOptionLabel={option => option['name']}
                                    onChange={(e) => this.setState({ dispositions: e })}
                                    placeholder="Choose a Form Template"
                                />
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

function mapStateToProps({ disposition_forms, queues }) {
    return {
        disposition_forms,
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Create));