import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import { updateAgentStatus } from '../../../../../actions/configurations';
import EditSubStatus from './editSubStatus';
import { formatDuration, formatTimeToSeconds } from '../../../../../config/util';

class CreateConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_substatus: {}
        };
    }

    componentWillMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.config !== prevProps.config) {
            this.init();
        }
    }

    init() {
        this.setState({
            ...this.state,
            ...this.props.config,
            duration_in_minutes: Math.round(this.props.config.duration_in_seconds / 60)
        })
    }

    clearForm() {
        this.props.onClose();
    }

    saveData(e) {
        e.preventDefault();

        const self = this;

        this.props.updateAgentStatus({ ...this.state }, (err) => {
            if (!err) {
                self.clearForm();
            }
        });
    }

    subStatusChanged(data) {
        if (this.state.substatus.length === 0) {
            data.sub_id = 1;
            this.setState({ substatus: [data], selected_substatus: {} });
            return;
        }
    
        const sub = this.state.substatus.map((s) => {
            if (s.sub_id === data.sub_id) {
                return { ...s, ...data };
            }
            return s;
        });
    
        if (data.sub_id) {
            this.setState({ substatus: sub, selected_substatus: {} });
        } else {
            const ids = this.state.substatus.map((s) => parseInt(s.sub_id));
            const id = _.max(ids) || 0;
            data.sub_id = id + 1;
            this.setState({ substatus: [...sub, data], selected_substatus: {} });
        }
    }
    

    deleteSub(sub) {
        if (window.confirm("Are you sure that you want to delete this sub status?")) {
            this.setState({ substatus: this.state.substatus.filter((a) => a.sub_id !== sub.sub_id) });
        }
    }

    render() {
        return (
            <form onSubmit={(e) => this.saveData(e)} >
                <CardBody>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="display_name">3CX Status Name</Label>
                                <Input disabled type="text" readOnly value={this.state.status_3cx} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="display_name">Status Name</Label>
                                <Input type="text" onChange={(e) => this.setState({ status_name: e.target.value })} value={this.state.status_name} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="last_name">Approved Time (Seconds)</Label>
                                <Input type="number" onChange={(e) => this.setState({ approved_time: formatDuration(e.target.value) })} value={formatTimeToSeconds(this.state.approved_time)} />
                            </FormGroup>
                        </Col>
                    </Row>
                    {this.state.id > 2 ?

                        <div className='p-3 bg-light rounded mb-3'>
                            <h5>Sub Statuses</h5>
                            <EditSubStatus onClear={() => this.setState({ selected_substatus: {} })} onChange={(data) => this.subStatusChanged(data)} config={this.state.selected_substatus} />
                        </div> : ""}
                    {
                        this.state.substatus && this.state.substatus.length ?
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Sub Status Name</th>
                                        <th>Approved Time</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.substatus.map((substatus) => (
                                        <tr key={substatus.sub_id}>
                                            <td>{substatus.sub_status_name}</td>
                                            <td>{substatus.approved_time}</td>
                                            <td>
                                                <div className="d-flex justify-content-around">
                                                    <Button size="sm" outline onClick={() => this.setState({ selected_substatus: substatus })} color="primary" title='Edit'  ><i className="fa fa-pencil" ></i></Button>
                                                    <Button size="sm" outline onClick={() => this.deleteSub(substatus)} color="danger" title='Delete' ><i className="fa fa-trash" ></i></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table> : ""}
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Save</Button>{' '}
                            <Button onClick={() => this.clearForm()} color="danger">Cancel</Button>
                        </Col>
                    </Row>
                </CardBody>
            </form>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateAgentStatus
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(CreateConfig));
