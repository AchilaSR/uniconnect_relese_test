
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import 'react-dates/initialize';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { listQueues } from '../../../actions/configurations';
import { createCampaigns, updateCampaigns, loadTemplates, loadTemplate } from '../../../actions/campaigns';
import { index as getListCLI } from '../../../modules/outbound-cli/action';
import Loader from '../../../components/Loader';
import moment from 'moment';
import _ from 'lodash';
import { index as getCustomFields } from '../../../modules/field-layout/action';
import { DIALING_MODES, DYNAMIC_DISPOSITION_FORMS, HOMEPAGE } from '../../../config/globals';

const dialing_types = DIALING_MODES;
const dialing_speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => ({ value: a, label: a }));

class Campaigns extends Component {
    constructor(props) {
        super(props);

        this.state = {
            template: "",
            "campign_id": null,
            "campaign_name": "",
            "outbound_cli": "",
            "outbound_queue": "",
            "dialing_speed": dialing_speeds[0],
            "dialing_type": dialing_types[0],
            "scheduled_start_time": new Date(),
            "scheduled_end_time": moment().add(24, "h").toDate(),
            "retry_attempts": "0",
            "retry_interval": "180",
            "field_ids": [],
            "save_template": false,
            "queueDisabled" : false
        };
    }



    componentWillMount() {
        this.props.loadTemplates();
        this.props.getListCLI();
        this.props.listQueues(() => {
            this.props.getCustomFields(() => {
                if (this.props.location.state) {
                    const { dialing_speed, dialing_type, scheduled_start_time, scheduled_end_time, outbound_queue, outbound_cli, field_ids = [], ...state } = this.props.location.state;
                    this.setState({
                        ...state,
                        "outbound_queue": _.find(this.props.queues, { extension: outbound_queue }),
                        "queueDisabled": true,
                        "outbound_cli": _.find(this.props.outbound_cli, { cli: outbound_cli }),
                        "dialing_speed": _.find(dialing_speeds, { value: dialing_speed }),
                        "dialing_type": _.find(dialing_types, { value: dialing_type }),
                        "scheduled_start_time": moment(scheduled_start_time).toDate(),
                        "scheduled_end_time": moment(scheduled_end_time).toDate(),
                        "field_ids": _.chain(this.props.field_layout).filter((a) => (field_ids.indexOf(a.id) > -1)).value()
                    }, () => {
                        console.log(this.state);
                    });
                }
            });
        });
    }

    cancel() {
        this.props.history.push('/campaigns')
    }

    save(e) {
        e.preventDefault();

        if (!this.state.outbound_queue) {
            window.alert("Please select a Queue");
            return;
        }

        const data = {
            ...this.state,
            "outbound_queue": this.state.outbound_queue ? this.state.outbound_queue.extension : null,
            "outbound_cli": this.state.outbound_cli ? this.state.outbound_cli.cli : "",
            "dialing_speed": this.state.dialing_speed ? this.state.dialing_speed.value : null,
            "dialing_type": this.state.dialing_type ? this.state.dialing_type.value : null,
            "scheduled_start_time": moment(this.state.scheduled_start_time).format("YYYY-MM-DD HH:mm:ss"),
            "scheduled_end_time": moment(this.state.scheduled_end_time).format("YYYY-MM-DD HH:mm:ss"),
            "field_ids": this.state.field_ids ? this.state.field_ids.map(a => a.id) : [],
            "save_template": this.state.save_template
        };

        if (data.campign_id) {
            this.props.updateCampaigns(data, () => {
                this.cancel();
            });
        } else {
            this.props.createCampaigns(data, () => {
                this.cancel();
            });
        }

    }
    selectTemplate(template) {
        this.setState({ template });
        this.props.loadTemplate(template.value, (data) => {
            this.setState({
                ...data,
                campaign_name: null,
                outbound_queue: _.find(this.props.queues, { extension: data.outbound_queue }),
                dialing_speed: _.find(dialing_speeds, { value: data.dialing_speed }),
                dialing_type: _.find(dialing_types, { value: data.dialing_type }),
                field_ids: _.chain(this.props.field_layout).filter((a) => (data.field_ids.indexOf(a.id) > -1)).value(),
                scheduled_start_time: moment(data.scheduled_start_time).toDate(),
                scheduled_end_time: moment(data.scheduled_end_time).toDate(),
                retry_attempts: data.retry_attempts,
                retry_interval: data.retry_interval || 60,
                outbound_cli: _.find(this.props.outbound_cli, { cli: data.outbound_cli }),
                save_template: false
            })
        });
    }

    render() {
        const { queues, templates, field_layout } = this.props;

        if (!templates || !queues || !field_layout) {
            return <Loader />;
        }
  
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a className="breadcrumb-item" href={`${HOMEPAGE}/campaigns`}>Campaigns</a></li>
                    <li className="breadcrumb-item active">Create</li>
                </ol>
                <div className="container-fluid mb-5">
                    <form onSubmit={(e) => this.save(e)}>
                        <Card>
                            <CardHeader>New Campaign</CardHeader>
                            <CardBody>
                                <Row>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="">Template</Label>
                                            <Select
                                                name="form-field-name2"
                                                value={this.state.template}
                                                options={templates.map(t => { return { value: t, label: t } })}
                                                onChange={(e) => this.selectTemplate(e)}
                                                placeholder="New campaign"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Campaign Name</Label>
                                            <Input type="text" id="name" placeholder="Enter the campaign name" required value={this.state.campaign_name} onChange={(e) => this.setState({ campaign_name: e.target.value })} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Schedule Start Time</Label>
                                            <DatePicker
                                                selected={this.state.scheduled_start_time}
                                                onChange={(scheduled_start_time) => this.setState({
                                                    scheduled_start_time,
                                                    scheduled_end_time: moment(this.state.scheduled_end_time).diff(scheduled_start_time, 's') < 0 ? moment(scheduled_start_time).add(24, "h").toDate() : this.state.scheduled_end_time
                                                })}
                                                showTimeSelect
                                                minDate={new Date()}
                                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                                className="form-control"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Schedule End Time</Label>
                                            <DatePicker
                                                selected={this.state.scheduled_end_time}
                                                onChange={(scheduled_end_time) => this.setState({
                                                    scheduled_end_time
                                                })}
                                                showTimeSelect
                                                minDate={this.state.scheduled_start_time}
                                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                                className="form-control"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Dialing Mode</Label>
                                            <Select
                                                value={this.state.dialing_type}
                                                options={dialing_types}
                                                onChange={(e) => this.setState({ dialing_type: e })}
                                                isMulti={false}
                                                className="multi-select"
                                                isDisabled={dialing_types.length <= 1}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Dialing Speed</Label>
                                            <Select
                                                value={this.state.dialing_speed}
                                                options={dialing_speeds}
                                                onChange={(e) => this.setState({ dialing_speed: e })}
                                                isMulti={false}
                                                isDisabled={this.state.dialing_type.value !== 3}
                                                className="multi-select"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Outbound Queue</Label>
                                            <Select
                                                value={this.state.outbound_queue}
                                                options={this.props.queues}
                                                onChange={(e) => this.setState({ outbound_queue: e })}
                                                isMulti={false}
                                                isDisabled={DYNAMIC_DISPOSITION_FORMS && this.state.queueDisabled == true }
                                                getOptionValue={option => option['extension']}
                                                getOptionLabel={option => option['display_name']}
                                                className="multi-select"
                                                isClearable={true}
                                                required
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Outbound CLI Name</Label>
                                            <Select
                                                value={this.state.outbound_cli}
                                                options={this.props.outbound_cli}
                                                onChange={(e) => this.setState({ outbound_cli: e })}
                                                isMulti={false}
                                                // isDisabled={this.state.dialing_type.value === 2}
                                                getOptionValue={option => option['id']}
                                                getOptionLabel={option => option['cli']}
                                                className="multi-select"
                                                isClearable={true}
                                                required
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Retry Attempts</Label>
                                            <Input
                                                // disabled={this.state.dialing_type.value === 2}
                                                type="number" id="name" min={0} placeholder="ex: 1" required value={this.state.retry_attempts} onChange={(e) => this.setState({ retry_attempts: e.target.value })} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3">
                                        <FormGroup>
                                            <Label htmlFor="name">Retry Interval (Seconds)</Label>
                                            <Input disabled={this.state.dialing_type.value === 2} type="number" id="name" placeholder="ex: 180" required min={60} value={this.state.retry_interval} onChange={(e) => this.setState({ retry_interval: e.target.value })} />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label htmlFor="name">Custom Fields View</Label>
                                            <Select
                                                value={this.state.field_ids}
                                                options={this.props.field_layout}
                                                onChange={(e) => this.setState({ field_ids: e })}
                                                isMulti={true}
                                                getOptionValue={option => option['id']}
                                                getOptionLabel={option => option['field_label']}
                                                className="multi-select"
                                                isClearable={true}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    type="checkbox"
                                                    checked={this.state.save_template}
                                                    onChange={(e) => this.setState({ save_template: e.target.checked })}
                                                />
                                                Save this Campaign as a Template
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                    <Col className="text-right">
                                        <Button type="submit" color="primary">Save</Button>{' '}
                                        <Button onClick={() => this.cancel()} color="danger">Cancel</Button>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ metadata, queues, field_layout, templates, outbound_cli }) {
    return {
        metadata,
        queues,
        field_layout,
        templates,
        outbound_cli
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createCampaigns,
        updateCampaigns,
        listQueues,
        getCustomFields,
        loadTemplates,
        loadTemplate,
        getListCLI
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Campaigns);
