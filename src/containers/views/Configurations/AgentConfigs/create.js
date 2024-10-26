import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { listUsers, saveConfig } from '../../../../actions/users';
import { loadCampaigns } from '../../../../actions/campaigns';


class AgentConfigs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: null,
            campaigns: null,
            dialingMode: false
        };
    }

    componentWillMount() {
        this.props.loadCampaigns();
        this.props.listUsers();
    }

    saveConfigs() {
        let self = this;
        let agentId = this.state.users.login_id;
        let campaignIds = _.map(this.state.campaigns, 'campign_id');
        let dialingMode = this.state.dialingMode ? 1 : 0;

        if (!agentId || !campaignIds) {
            alert("Please fill all the feilds");
            return;
        }

        let data = { agentId, campaignIds, dialingMode };
        this.props.saveConfig(data, function () {
            self.setState({
                users: null,
                campaigns: null,
                dialingMode: false
            });
        });
    }

    cancelBtn(){
        this.props.onClose();
    }

    render() {
        const { campaigns, users } = this.props;

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
                                getOptionValue={option => option['login_id']}
                                getOptionLabel={option => option['login_username']}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="name">Campaigns</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.campaigns}
                                options={campaigns}
                                onChange={(e) => this.setState({ campaigns: e })}
                                isMulti={true}
                                getOptionValue={option => option['campign_id']}
                                getOptionLabel={option => option['campaign_name']}
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input checked={this.state.dialingMode} onChange={() => this.setState({ dialingMode: !this.state.dialingMode })} type="checkbox" />{' '}Predictive Mode Enabled</Label>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.saveConfigs()} color="primary">Save</Button>{' '}
                        <Button onClick={() => this.cancelBtn()} color="danger">Cancel</Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ campaigns, users }) {
    return {
        campaigns, users
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listUsers,
        saveConfig,
        loadCampaigns
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(AgentConfigs));