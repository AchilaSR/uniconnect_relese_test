import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Badge, Progress } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import { getCampaignList, restore, deleteCampaign } from '../action';
import { loadLeadStatuses, changeFilter } from '../../../actions/campaigns';
import { checkPermission, formatCurrency } from '../../../config/util';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';
import paginationFactory from 'react-bootstrap-table2-paginator';

class Templates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            campaignReadAccess: false,
            campaignWriteAccess: false,
        };
    }

    handleViewRow(row) {
        this.props.history.push("facilities", row);
    }

   restoreCampaign(id) {
        if (window.confirm("Are you sure, you want to restore this campaign?")) {
            this.props.restore(id);
        }
    }

    deleteCampaign(id) {
        if (window.confirm("Are you sure, you want to delete this campaign?")) {
            this.props.deleteCampaign(id);
        }
    }

    componentWillMount() {
        this.props.getCampaignList();
        this.props.loadLeadStatuses();
        this.setState({ campaignReadAccess: checkPermission('Campaigns Management', 'READ') });
        this.setState({ campaignWriteAccess: checkPermission('Campaigns Management', 'WRITE') });
    }
    renderProgress(code, cell, total = 1) {
        const { leadstatus } = this.props;
        const color = _.find(leadstatus, ['statuscode', code]).colorcode;
        const name = _.find(leadstatus, ['statuscode', code]).statusdescription;
        const value = _.find(cell, ['stat_code', code]) ? _.find(cell, ['stat_code', code]).lead_count : 0;
        if (value) {
            return <Progress className="tooltip-target" bar max={total} color={color} value={value} >
                {value}
                <span className={`bg-${color} tooltip-content`}>{`${value} ${name}`}</span>
            </Progress>
        } else {
            return ""
        }

    }

    clearFilters() {
        this.props.changeFilter({ page: 1, outbound_queue: null, search: "" });
    }

    render() {
        const { deleted_campaigns , leadstatus, campaign_filters } = this.props;

        if (!deleted_campaigns || !leadstatus) {
            return <Loader />;
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

        let filtered = deleted_campaigns.Campaigns;
        let page = campaign_filters.page || 1;

        if (page > 1 && deleted_campaigns.length <= ((page - 1) * 10)) {
            this.props.changeFilter({ page: 1 });
            return <Loader />;
        }

        const columns = [{
            dataField: 'campaign_name',
            text: 'Campaign Name',
            headerStyle: {
                width: 270
            },
            formatter: (cellContent, row) => <div>
                {cellContent} <br />
                {getDialingType(row.dialing_type)} {" "}
                <small>
                    {row.last_started_on} -  {row.last_ends_on}
                </small>
            </div>
        },{
            dataField: 'total_leads',
            text: 'Leads',
            headerStyle: {
                width: 60
            },
            align: 'right',
            formatter: (cellContent) => formatCurrency(cellContent, 0, 0)
        }, {
            dataField: 'success_count',
            text: 'Success',
            headerStyle: {
                width: 60
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
                        {this.renderProgress(1, cellContent, row.total_leads)}
                        {this.renderProgress(2, cellContent, row.total_leads)}
                        {this.renderProgress(3, cellContent, row.total_leads)}
                        {this.renderProgress(4, cellContent, row.total_leads)}
                        {this.renderProgress(5, cellContent, row.total_leads)}
                        {this.renderProgress(6, cellContent, row.total_leads)}
                        {this.renderProgress(7, cellContent, row.total_leads)}
                        {this.renderProgress(8, cellContent, row.total_leads)}
                    </Progress>
                );
            }
        },
        {
            dataField: 'deleted_on',
            text: 'Deleted On',
            headerStyle: {
                width: 150
            }
        }, {
            dataField: 'campign_id',
            text: '',
            headerStyle: {
                width: 100
            }, hidden: !this.state.campaignWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.restoreCampaign(cellContent)} color="danger"><i className="fa fa-undo" ></i></Button>
                        <Button size="sm" outline onClick={() => this.deleteCampaign(cellContent)} color="danger"><i className="fa fa-trash" ></i></Button>
                    </div>
                );

            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Campaign History</li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardHeader>
                            Archived Campaigns
                        </CardHeader>
                        <CardBody>
                            {/* {deleted_campaigns.Campaigns.length > 0 ? <BootstrapTable keyField='name' data={deleted_campaigns.Campaigns} columns={columns} /> : "No data available"} */}
                            <div className="d-flex justify-content-between">
                                    <div className="flex-grow-1">
                                        {filtered && filtered.length > 0 ? <BootstrapTable key={Date.now()} pagination={paginationFactory({
                                            page: campaign_filters.page,
                                            hideSizePerPage: true,
                                            onPageChange: (page) => {
                                                this.props.changeFilter({ page })
                                            }
                                        })} keyField='campign_id' data={filtered} columns={columns} /> : "No data available"}
                                    </div>
                                    {this.state.showLegend ?
                                        <div className="ml-3" style={{ width: 200 }}>

                                        </div> : ""}
                                </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ templates, deleted_campaigns, leadstatus, campaign_filters }) {
    return {
        templates,
        deleted_campaigns,
        leadstatus,
        campaign_filters
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        restore,
        getCampaignList,
        loadLeadStatuses,
        changeFilter,
        deleteCampaign
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Templates);
