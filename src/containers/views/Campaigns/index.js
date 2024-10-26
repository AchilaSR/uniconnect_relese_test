import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Progress, Button, Table, FormGroup, Label, Row, Col, Input, Badge } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import _ from 'lodash';
import Loader from '../../../components/Loader';
import { loadLeadStatuses, loadCampaigns, changeStatus, changeFilter, deleteCampaign } from '../../../actions/campaigns';
import { checkPermission, formatCurrency } from '../../../config/util';
import Modal from '../../../components/Modal';
import Reschedule from './reschedule';
import Select from 'react-select';
import { listQueues } from '../../../actions/configurations';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { CAMPAIGN_REFRESH_INTERVAL, DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';

class Campaigns extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showLegend: false,
            campaignReadAccess: false,
            campaignWriteAccess: false
        };
    }

    renderProgress(code, cell, total = 1, row) {
        const { leadstatus } = this.props;
        const color = _.find(leadstatus, ['statuscode', code]).colorcode;

        const name = _.find(leadstatus, ['statuscode', code]).statusdescription;
        const value = _.find(cell, ['stat_code', code]) ? _.find(cell, ['stat_code', code]).lead_count : 0;

        if (value) {
            return <Progress
                animated={row.campaign_status === "RUNNING" && color === "GREEN"}
                className="tooltip-target" bar max={total} color={color} value={value} >
                {value}
                <span className={`bg-${color} tooltip-content`}>{`${value} ${name}`}</span>
            </Progress>
        } else {
            return ""
        }

    }

    handleEditRow(row) {
        this.props.history.push("campaigns/new", row);
    }

    handleUploadRow(row) {
        this.props.history.push("leads/upload", row);
    }

    handleViewRow(row) {
        this.props.history.push("leads/campaign", row);
    }

    handleViewDashboard(row) {
        this.props.history.push(`/campaign/${row.campign_id}/monitor`, row);
    }

    componentWillMount() {

        this.props.loadLeadStatuses(() => {
            this.props.loadCampaigns();
            this.refreshIntervalCampaign = window.setInterval(() => {
                this.props.loadCampaigns();
            }, CAMPAIGN_REFRESH_INTERVAL * 1000);
        });

        this.props.listQueues();
        this.setState({ campaignReadAccess: checkPermission('Campaigns Management', 'READ') });
        this.setState({ campaignWriteAccess: checkPermission('Campaigns Management', 'WRITE') });
    }

    componentWillUnmount() {
        const currentRoute = this.props.history.location.pathname;

        if (!_.startsWith(currentRoute, '/campaigns/') && !_.startsWith(currentRoute, '/leads')) {
            this.clearFilters();
        }

        window.clearInterval(this.refreshIntervalCampaign);
    }

    changeStatus(campaign_id, status, next) {
        let actions = { 1: "start", 0: "stop", 9: "delete" };

        if (window.confirm("Are you sure, you want to " + actions[status] + " the campaign?")) {
            this.props.changeStatus(campaign_id, status);
            next(true);
        } else {
            next(false);
        }

    }

    changeAutoStatus(campaign_id, status, next) {
        this.props.changeStatus(campaign_id, status);
        // next(true);
    }

    deleteStatus(campaign_id, status) {
        let actions = { 1: "start", 2: "stop", 9: "delete" };
        if (window.confirm("Are you sure, you want to " + actions[status] + " the campaign?")) {
            this.props.deleteCampaign(campaign_id);
        }
    }

    clearFilters() {
        this.props.changeFilter({ page: 1, outbound_queue: null, search: "" });
    }

    getAnswerRate(cell, row) {
        let count = 0;

        if (_.find(row.CampaignLeadsStats, ['stat_code', 6])) {
            count = _.find(row.CampaignLeadsStats, ['stat_code', 6]).lead_count;

            if (count) {
                return formatCurrency(count / cell * 100) + "%";
            }
        }
    }

    render() {
        const { campaigns, leadstatus, campaign_filters } = this.props;

        if (!campaigns || !leadstatus) {
            return <Loader />;
        }

        const currentTime = new Date();

        //Campaign auto stop
        campaigns.forEach(campaign => {
            const scheduledEndTime = new Date(campaign.scheduled_end_time);
            if (campaign.campaign_status === "RUNNING" && scheduledEndTime < currentTime) {
                this.changeAutoStatus(campaign.campign_id, 0, true, (success) => {
                    if (success) {
                        console.log(`Campaign ${campaign.campaign_name} has been stopped.`);
                    } else {
                        console.log(`Failed to stop campaign ${campaign.campaign_name}.`);
                    }
                });
            }
        });

        let filtered = campaigns;
        let page = campaign_filters.page || 1;

        if (page > 1 && campaigns.length <= ((page - 1) * 10)) {
            this.props.changeFilter({ page: 1 });
            return <Loader />;
        }

        if (campaign_filters.outbound_queue) {
            filtered = filtered.filter((a) => a.outbound_queue === campaign_filters.outbound_queue.extension)
        }

        if (campaign_filters.search) {
            filtered = filtered.filter((a) => a.campaign_name.toLowerCase().indexOf(campaign_filters.search.toLowerCase()) > -1);
        }

        if (campaign_filters.is_running) {
            filtered = filtered.filter((a) => a.campaign_status === "RUNNING");
        }



        const getDialingType = (type) => {
            switch (type) {
                case 1:
                    return <Badge color='danger'>Predictive</Badge>
                case 2:
                    return <Badge color='success'>Preview</Badge>
                case 3:
                    return <Badge color='warning'>Power</Badge>
            }
        }

        const columns = [{
            dataField: 'campaign_name',
            text: 'Campaign Name',
            headerStyle: {
                width: 270
            },
            formatter: (cellContent, row) => <div>
                [{row.campign_id}] {cellContent}<br />
                {getDialingType(row.dialing_type)} {" "}
                <small>
                    {row.last_started_on} -  {row.last_ends_on}
                </small>
            </div>
        }, {
            dataField: 'total_leads',
            text: 'Leads',
            headerStyle: {
                width: 80
            },
            align: 'right',
            formatter: (cell, row) => <div>
                {formatCurrency(cell, 0, 0)}
            </div>
        }, {
            dataField: 'total_leads',
            text: 'Answered',
            headerStyle: {
                width: 80
            },
            align: 'right',
            formatter: (cell, row) => <div>
                {this.getAnswerRate(cell, row)}
            </div>
        }, {
            dataField: 'success_count',
            text: 'Success',
            headerStyle: {
                width: 80
            },
            align: 'right',
            formatter: (cellContent) => formatCurrency(cellContent, 0),
            hidden: DYNAMIC_DISPOSITION_FORMS
        }, {
            dataField: 'CampaignLeadsStats',
            text: 'Status',
            formatter: (cellContent, row) => {
                return (
                    <Progress multi>
                        {leadstatus.map((a) => this.renderProgress(a.statuscode, cellContent, row.total_leads, row))}
                    </Progress>
                );
            }
        }, {
            dataField: 'campaign_status',
            text: '',
            headerStyle: {
                width: 220
            }, hidden: !this.state.campaignWriteAccess,
            formatter: (cellContent, row) => {
                const isQueueBusy = _.find(campaigns, { outbound_queue: row.outbound_queue, campaign_status: "RUNNING" });
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" disabled={cellContent !== "STOPPED"} outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleUploadRow(row)} color="primary" title='Upload'><i className="fa fa-upload" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleViewRow(row)} color="primary" title='View'><i className="fa fa-eye" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleViewDashboard(row)} color="primary" title='Monitor'><i className="fa fa-dashboard" ></i></Button>
                        {cellContent === "STOPPED" ?
                            <Button
                                size="sm"
                                outline
                                disabled={isQueueBusy || !row.total_leads}
                                onClick={() => {
                                    this.forceUpdate();
                                    this.changeStatus(row.campign_id, 1, (changed) => {
                                        if (changed) {
                                            row.campaign_status = "RUNNING";
                                            this.forceUpdate();
                                        }
                                    })
                                }}
                                color="primary"
                                title="Play"
                            >
                                <i className="fa fa-play"></i>
                            </Button> :
                            <Button
                                size="sm"
                                outline
                                onClick={() => {
                                    this.changeStatus(row.campign_id, 0, (changed) => {
                                        if (changed) {
                                            row.campaign_status = "STOPPED";
                                            this.forceUpdate();
                                        }
                                    });
                                }}
                                color="danger"
                            >
                                <i className="fa fa-stop"></i>
                            </Button>}
                        <Button size="sm" disabled={cellContent !== "STOPPED"} outline onClick={() => this.setState({ selectedCampaign: row })} color="primary" title='Reshedule'><i className="fa fa-random" ></i></Button>
                        <Button size="sm" outline disabled={cellContent !== "STOPPED"} onClick={() => this.deleteStatus(row.campign_id, 9)} color="danger" title='Delete'><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        //sort campaign by desc order
        const sortedCampaignData = filtered.sort((a, b) => b.campign_id - a.campign_id);

        filtered = sortedCampaignData

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Campaigns</li>
                    <li className="breadcrumb-menu">
                        {this.state.campaignWriteAccess ? <div className="btn-group">
                            <Link className="btn" to="/campaigns/new"><i className="fa fa-plus"></i> New Campaign</Link>
                            <Link className="btn" to="/campaign-archive">
                                <i className="fa fa-archive"></i> Archived Campaigns
                            </Link>
                        </div> : null}
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className='mr-3 mb-3' style={{ width: 300 }}>
                            <Card>
                                <CardHeader>Filter</CardHeader>
                                <CardBody>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label htmlFor="name">Outbound Queue</Label>
                                                <Select
                                                    value={campaign_filters.outbound_queue}
                                                    options={this.props.queues}
                                                    onChange={(e) => this.props.changeFilter({ outbound_queue: e, page: 1 })}
                                                    isMulti={false}
                                                    getOptionValue={option => option['extension']}
                                                    getOptionLabel={option => option['display_name']}
                                                    className="multi-select"
                                                    isClearable={true}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label htmlFor="name">Campaign Name</Label>
                                                <Input placeholder='Search' value={campaign_filters.search} onChange={(e) => this.props.changeFilter({ search: e.target.value, page: 1 })} />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input
                                                        type="checkbox"
                                                        checked={campaign_filters.is_running}
                                                        onChange={() =>
                                                            this.props.changeFilter({ is_running: !campaign_filters.is_running, page: 1 })
                                                        }
                                                    />
                                                    Running Campaigns
                                                </Label>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {campaign_filters.page > 1 || campaign_filters.search || campaign_filters.outbound_queue ? <Row className='mt-3'>
                                        <Col>
                                            <Button onClick={() => { this.clearFilters() }} type='button' color='danger'>Clear</Button>
                                        </Col>
                                    </Row> : ""}
                                </CardBody>
                            </Card>
                            <Card className='mr-3' style={{ width: 300 }}>
                                <CardHeader>Legend</CardHeader>
                                <CardBody>
                                    <Table borderless size='sm' striped={true}>
                                        <tbody>
                                            {
                                                leadstatus.map((s) => {
                                                    return (
                                                        <tr key={s.colorcode} className="legend pb-2">
                                                            <td className={`bg-${s.colorcode}`}>&nbsp;</td><td className="pl-2">{s.statusdescription}</td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </div>
                        <Card className="flex-grow-1" >
                            <CardHeader>
                                Campaigns
                            </CardHeader>
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div className="flex-grow-1">
                                        {filtered.length > 0 ? <BootstrapTable key={Date.now()} pagination={paginationFactory({
                                            page: campaign_filters.page,
                                            hideSizePerPage: true,
                                            onPageChange: (page) => {
                                                this.props.changeFilter({ page })
                                            }
                                        })} keyField='campign_id' data={filtered} columns={columns}
                                        /> : "No data available"}
                                    </div>
                                    {this.state.showLegend ?
                                        <div className="ml-3" style={{ width: 200 }}>

                                        </div> : ""}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
                <Modal toggle={() => { this.setState({ selectedCampaign: null }) }} size="lg" title="Re-Schedule Campaign" isOpen={this.state.selectedCampaign}>
                    <Reschedule statuses={leadstatus} campaign={this.state.selectedCampaign} onClose={() => this.setState({ selectedCampaign: null })} />
                </Modal>
            </div >
        );
    }
}

function mapStateToProps({ leadstatus, campaigns, queues, campaign_filters }) {
    return {
        leadstatus,
        campaigns,
        queues,
        campaign_filters
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadCampaigns, loadLeadStatuses, changeStatus, listQueues, changeFilter, deleteCampaign
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Campaigns);