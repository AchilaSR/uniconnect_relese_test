import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listExtensions, listKPIParameters } from '../../../../actions/configurations';
import { loadKPIReport } from '../../../../actions/reports';
import _ from 'lodash';

import Select from 'react-select';

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            extensions: [],
            kpi_params: [],
            allExtensions: false,
            allKPIParams: false
        };
    }

    componentWillMount() {
        this.props.listExtensions();
        this.props.listKPIParameters();
    }


    generateReport() {
        let extensions = this.state.extensions;
        let kpi_ids = this.state.kpi_params;

        if (this.state.allExtensions) {
            extensions = this.props.configurations
        }

        if (this.state.allKPIParams) {
            kpi_ids = this.props.metadata.kpi_params
        }

        if (extensions.length && kpi_ids.length) {
            this.props.loadKPIReport({ extensions: _.map(extensions, "id"), kpi_ids: _.map(kpi_ids, "code") })
        } else {
            alert("Please fill all the feilds");
            return;
        }
    }

    render() {
        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">Extensions</Label>
                            <Select
                                value={this.state.extentions}
                                options={this.props.configurations}
                                onChange={(e) => this.setState({ extensions: e })}
                                isMulti={true}
                                getOptionValue={option => option['id']}
                                getOptionLabel={option => option['extension']}
                                className="multi-select"
                                isDisabled={this.state.allExtensions}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allExtensions} onChange={() => this.setState({ allExtensions: !this.state.allExtensions })} type="checkbox" />{' '}
                                    Select all Extensions
                                            </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="name">KPI Parameters</Label>
                            <Select
                                value={this.state.kpi_params}
                                options={this.props.metadata.kpi_params}
                                onChange={(e) => this.setState({ kpi_params: e })}
                                isMulti={true}
                                getOptionValue={option => option['code']}
                                getOptionLabel={option => option['KPI_Name']}
                                className="multi-select"
                                isDisabled={this.state.allKPIParams}
                            />
                            <FormGroup check>
                                <Label check>
                                    <Input checked={this.state.allKPIParams} onChange={() => this.setState({ allKPIParams: !this.state.allKPIParams })} type="checkbox" />{' '}
                                    Select all Parameters
                                            </Label>
                            </FormGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.generateReport()} color="primary">Generate Report</Button>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}

function mapStateToProps({ configurations, metadata }) {
    return {
        configurations,
        metadata
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listExtensions,
        listKPIParameters,
        loadKPIReport
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateGroup));