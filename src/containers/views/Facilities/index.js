import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import { CSVLink } from 'react-csv';
import { index as loadCustomFields } from '../../../modules/field-layout/action';
import { loadFacilities, deleteFacility } from '../../../actions/facilities';
import { loadLeadStatuses, loadCampaigns } from '../../../actions/campaigns';
import { checkPermission, getReportData } from '../../../config/util';
import { searchTypes } from '../../../actions/config';
import FilterReport from './filter';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { DEFAULT_PAGE_SIZE, HOMEPAGE, LEAD_STATUS } from '../../../config/globals';
class Dial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showLegend: false,
            filtered_facilities: [],
            writePermission: false,
            paged_records: null,
            page: 1,
            totalSize: 0,
            filters: []
        }
    }

    handleViewRow(row) {
        this.props.history.push({
            pathname: "/leads/dial",
            search: `?search=${row.id}&searchBy=${searchTypes.LEAD_ID}`
        })
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this details?")) {
            this.props.deleteFacility(row.id, () => {
                this.setPage();
            });
        }
    }

    componentWillMount() {
        const campaign = this.props.location.state ? this.props.location.state : {};

        this.setState({ filters: { campaign } })
        let data = {
            "campaign_id": campaign.campign_id,
            "limit": 10,
            "offset": this.state.totalSize,
            "phone": null,
            "disposition": null,
            "status": [],
            "startDate": null,
            "endDate": null
        }
        this.props.loadFacilities(data, (err, data) => {
            this.setState({ paged_records: data, totalSize: data.length + 1 })
        });
        this.props.loadLeadStatuses();
        this.props.loadCustomFields();
        this.props.loadCampaigns();
        this.setState({ writePermission: checkPermission('Facility Management', 'WRITE') });
    }



    setPage() {
        const { filters } = this.state;
        let data = {
            "campaign_id": filters.campaign ? filters.campaign.campign_id : null,
            "limit": 10,
            "offset": (this.state.page - 1) * 10,
            "phone": filters.phone ? filters.phone : null,
            "disposition": filters.disposition ? filters.disposition : null,
            "status": filters.status ? filters.status : [],
            "startDate": null,
            "endDate": null
        }
        this.props.loadFacilities(data, (err, res) => {

            if (res.length != 0) {
                this.setState({ paged_records: res, totalSize: data.offset + res.length + 1 })
            }
        });
    }

    changeFilter(data, filters) {
        this.setState({ paged_records: data, filters: filters, page: 1, totalSize: data.length + 1 })
    }

    render() {
        const { facilities, leadstatus, field_layout, campaigns, pageSize = DEFAULT_PAGE_SIZE } = this.props;
        const { paged_records, page, totalSize } = this.state;

        const filtered_facilities = this.state.filtered_facilities;

        if (!paged_records || !leadstatus || !field_layout || !campaigns) {
            return <Loader />;
        }

        const { data, headers } = getReportData(filtered_facilities);

        console.log(data, headers);

        const sizePerPage = pageSize;

        const custom_fields = _.filter(field_layout, { show_in_list_view: 1 }).map((a) => ({
            dataField: a.field_id,
            text: a.field_label,
            hidden: true
        }));

        const onTableChange = (type, value) => {
            if (this.state.page >= value.page) {
                this.setState({ page: this.state.page - 1, totalSize: this.state.totalSize - 10 }, () => {
                    this.setPage();
                });

            } else {
                if (facilities.length != 0) {
                    console.log(this.state.totalSize)
                    this.setState({ page: this.state.page + 1 }, () => {
                        this.setPage();
                    });
                } else {
                    this.setPage({ page: 1, totalSize: 0 })
                }
            }
        }
        const CustomToggleList = ({
            columns,
            onColumnToggle,
            toggles,
            changeColumnState
        }) => {
            return (<div>
                {
                    columns
                        .map(column => ({
                            ...column,
                            toggle: toggles[column.dataField]
                        }))
                        .map(column => {
                            if (column.text && column.dataField !== "lead_status") {
                                return <FormGroup key={column.dataField} check>
                                    <Label check>
                                        <Input checked={column.toggle} onClick={() => {
                                            onColumnToggle(column.dataField);
                                            if (changeColumnState) {
                                                changeColumnState(column.dataField)
                                            }
                                        }} type="checkbox" id="checkbox2" />{' '}
                                        {column.text}
                                    </Label>
                                </FormGroup>
                            } else {
                                return undefined;
                            }
                        })
                }
            </div>)
        };

        const columns = [{
            dataField: 'id',
            text: 'ID',
            headerStyle: {
                width: 120
            },
        }, {
            dataField: 'number',
            text: 'Phone #',
            headerStyle: {
                width: 120
            },
        }, {
            dataField: 'campaign_id',
            text: 'Campaign',
            formatter: (cellContent, row) => ((_.find(campaigns, ['campign_id', cellContent]) || { campaign_name: "Archived Campaign" }).campaign_name)
        },
        ...custom_fields,
        {
            dataField: 'attempt',
            text: 'Attempts',
            align: 'right',
            headerStyle: {
                width: 60
            },
        }, {
            dataField: 'lead_status',
            text: 'Lead Status',
            hidden: !LEAD_STATUS,
            headerStyle: {
                width: 150
            },
            classes: "text-center"
        }, {
            dataField: 'disposition',
            text: 'Disposition',
            hidden: true
        }, {
            dataField: 'followup_note',
            text: 'Follow Up Note',
            hidden: true
        }, {
            dataField: 'dialing_status_id',
            text: 'Dialing Status',
            headerStyle: {
                width: 150
            },
            classes: (cellContent) => {
                const color = _.find(leadstatus, ['statuscode', cellContent]).colorcode;
                return `bg-${color} text-center font-weight-bold`;
            },
            formatter: (cellContent, row) => (_.startCase(_.find(leadstatus, ['statuscode', cellContent]).statusname))
        }, {
            dataField: 'extension_id',
            text: '',
            headerStyle: {
                width: 100
            },
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <a href={`${HOMEPAGE}/leads/dial?search=${row.id}&searchBy=${searchTypes.LEAD_ID}`} className='btn btn-outline-primary btn-sm' title='View'><i className="fa fa-eye" ></i></a>
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title='Delete'><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Leads</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {/* <CSVLink data={data} headers={headers} filename={"leads.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> */}
                            <Link className="btn" to="/leads/dial"><i className="fa fa-search"></i> Search Leads</Link>
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <FilterReport filters={this.state.filters} leadstatus={leadstatus} isCampaignLead={false} data={facilities} sendData={this.getData} onFiltered={(data, filters) => this.changeFilter(data, filters)} />
                        <Card className="flex-grow-1">
                            <CardHeader>
                                Leads {this.state.filters.campaign && this.state.filters.campaign.campaign_name ? `of ${this.state.filters.campaign.campaign_name}` : ""}
                                <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a>
                            </CardHeader>
                            <CardBody>
                                {paged_records.length > 0 ? <ToolkitProvider
                                    keyField="id"
                                    data={paged_records}
                                    columns={columns}
                                    columnToggle
                                >{
                                        props =>
                                            <Row>
                                                <Col xs={this.state.showLegend ? 10 : 12}>
                                                    <div style={{ position: "relative" }}>
                                                        <BootstrapTable
                                                            onTableChange={onTableChange}
                                                            remote
                                                            wrapperClasses="table-responsive"
                                                            classes="mb-2"
                                                            {...props.baseProps}
                                                            pagination={paginationFactory({ paginationSize: 1, page: page, sizePerPage, totalSize: totalSize, hideSizePerPage: true, withFirstAndLast: false })} />
                                                    </div>
                                                </Col>
                                                {
                                                    this.state.showLegend ?
                                                        <Col xs="2">
                                                            <CustomToggleList changeColumnState={(columnName) => {
                                                                columns.forEach((column) => {
                                                                    if (column.dataField == columnName) {
                                                                        column.hidden = !column.hidden
                                                                    }
                                                                })
                                                            }} btnClassName="btn-outline" {...props.columnToggleProps} />
                                                        </Col> : ""}
                                            </Row>
                                    }
                                </ToolkitProvider> : "No data available"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ facilities, leadstatus, field_layout, campaigns }) {
    return {
        facilities,
        leadstatus,
        field_layout,
        campaigns
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadFacilities,
        loadLeadStatuses,
        deleteFacility,
        loadCustomFields,
        loadCampaigns
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);