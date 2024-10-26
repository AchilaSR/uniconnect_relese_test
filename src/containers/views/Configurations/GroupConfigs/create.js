import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { listGroups, saveConfig } from '../../../../actions/groups';
import { loadCampaigns } from '../../../../actions/campaigns';


class GroupConfigs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            group: null,
            campaigns: null,
            dialingMode: false
        };
    }

    componentWillMount() {
        this.props.loadCampaigns();
        this.props.listGroups();
    }

    saveConfigs() {
        let self = this;
        let groupId = this.state.group.group_id;
        let campaignIds = _.map(this.state.campaigns, 'campign_id');
        let dialingMode = this.state.dialingMode ? 1 : 0;

        if (!groupId || !campaignIds) {
            alert("Please fill all the feilds");
            return;
        }

        let data = { groupId, campaignIds, dialingMode };
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
        const { campaigns, groups } = this.props;

        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Group</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.group}
                                options={groups}
                                onChange={(e) => this.setState({ group: e })}
                                isMulti={false}
                                getOptionValue={option => option['group_id']}
                                getOptionLabel={option => option['group_name']}
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
                                <Input checked={this.state.dialingMode} onChange={() => this.setState({ dialingMode: !this.state.dialingMode })} type="checkbox" />{' '}Enable Auto Dialing</Label>
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

function mapStateToProps({ campaigns, groups }) {
    return {
        campaigns, groups
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listGroups,
        saveConfig,
        loadCampaigns
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(GroupConfigs));