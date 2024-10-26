import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { listUsers } from '../../../../actions/users';
import { listQueues } from '../../../../actions/configurations';
import Slider from 'rc-slider';


class AgentConfigs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: null,
            queues: [],
            priority: null
        };
    }

    componentWillMount() {
        this.props.listQueues();
        this.props.listUsers();
    }

    filter() {
        let agent_ext = this.state.users ? this.state.users.extension : null;
        let assigned_queues = this.state.queues ? this.state.queues.extension : null;
        let priority = this.state.priority;

        let data = { agent_ext, assigned_queues, priority };
        this.props.onFilter(data);
    }

    cancelBtn() {
        this.setState({
            users: null,
            queues: [],
            priority: null
        })
        this.props.onFilter({});
    }

    render() {
        const { queues, users } = this.props;

        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Agent</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.users}
                                options={users}
                                onChange={(e) => this.setState({ users: e })}
                                isMulti={false}
                                getOptionValue={option => option['extension']}
                                getOptionLabel={option => option['login_username']}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="name">Queues</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.queues}
                                options={queues}
                                onChange={(e) => this.setState({ queues: e })}
                                isMulti={false}
                                getOptionValue={option => option['extension']}
                                getOptionLabel={option => option['display_name']}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Priority</Label>
                            <br />
                            <div className='p-3 px-5 pb-4 mb-3 border rounded'>
                                <Slider
                                    min={1}
                                    max={5}
                                    step={1}
                                    included={false}
                                    value={this.state.priority}
                                    onChange={(e) => this.setState({ priority: e })}
                                    marks={{
                                        1: "Very Low",
                                        2: "Low",
                                        3: "Medium",
                                        4: "High",
                                        5: "Very High"
                                    }}
                                />
                            </div>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.filter()} color="primary">Filter</Button>{' '}
                        <Button onClick={() => this.cancelBtn()} color="danger">Clear</Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ queues, users }) {
    return {
        queues, users
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listUsers,
        listQueues
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(AgentConfigs));