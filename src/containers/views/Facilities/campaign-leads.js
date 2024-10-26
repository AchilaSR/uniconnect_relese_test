import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Input, Table, CustomInput, Badge } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import { CSVLink } from 'react-csv';
import { index as loadCustomFields } from '../../../modules/field-layout/action';
import { loadFacilities, deleteFacility } from '../../../actions/facilities';
import { loadLeadStatuses, loadCampaigns } from '../../../actions/campaigns';
import { checkPermission, formatDateTime, getReportData } from '../../../config/util';
import { searchTypes } from '../../../actions/config';
import FilterReport from './filter';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { DEFAULT_PAGE_SIZE, HOMEPAGE, LEAD_STATUS } from '../../../config/globals';
import { loadAgents } from '../../../actions/reports';

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
        this.props.loadAgents();

        const campaign = this.props.location.state ? this.props.location.state : {};

        this.setState({ filters: { campaign } })
        let data = {
            "campaign_id": campaign.campign_id,
            "limit": 1000000,
            "offset": 0,
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
            "limit": "100000",
            "offset": "0",
            "phone": filters.phone ? filters.phone : null,
            "disposition": filters.disposition ? filters.disposition : null,
            "status": filters.status ? filters.status : [],
            "startDate": null,
            "endDate": null
        }
        this.props.loadFacilities(data, (err, res) => {

            // if (res.length != 0) {
            //     this.setState({ paged_records: res, totalSize: data.offset + res.length + 1 })
            // }
        });
    }

    changeFilter(data, filters) {
        console.log("filter changed", data);
        // this.setState({ paged_records: data, filters: filters, page: 1, totalSize: data.length + 1 })
    }

    getColor(color) {

        const colors = {
            "GREEN": "#018839",
            "BROWN": "#8f5b0d",
            "YELLOW": "#f1c40f",
            "LIGHT_GREEN": "#cce00e",
            "LIGHT_RED": "#f08172",
            "ORANGE": "#e67e22",
            "GRAY": "#34495e",
            "RED": "#e62f22",
            "white": "#dadada",
            "bronze": "#ad8a56",
            "titanium": "#878681"
        };
        return colors[color] || color;
    }

    render() {
        const { facilities, leadstatus, field_layout, campaigns, pageSize = DEFAULT_PAGE_SIZE, agents } = this.props;
        const { paged_records, page, totalSize } = this.state;


        if (!paged_records || !leadstatus || !field_layout || !campaigns) {
            return <Loader />;
        }
  
        if (agents.length === 0) {
            return <Loader />;
        }

        let { data, headers } = getReportData(facilities);



        let headers2 = [
            { key: 'id', label: 'Id' },
            { key: 'number', label: 'Number' },
            { key: 'attempt', label: 'Attempts' },
            { key: 'uploaded_on', label: 'Uploaded on' },
            { key: 'dialed_on', label: 'Last Dialed On' },
            { key: 'extension', label: 'Agent' }
        ];

        const filteredFields = _.filter(field_layout, (a) => this.state.filters.campaign.field_ids.indexOf(a.id) > -1).map((a) => ({
            key: a.field_id,
            label: a.field_label,
        }));

        headers2 = [...headers2, ...filteredFields];

        headers = headers2;

        let custom_fields = _.filter(field_layout, (a) => this.state.filters.campaign.field_ids.indexOf(a.id) > -1).map((a) => ({
            dataField: a.field_id,
            text: a.field_label
        }));


        if (!data) {
            data = [],
                headers = []
        } else {
            for (const key in data[0]) {
                if (key.startsWith('cf_') && data[0][key] == "") {
                    delete data[0][key];

                    headers = headers.filter(header => header.key !== key);
                }


            }

            data.forEach(d => {
                let agent = agents.find(agent => agent.AgentExtension === d.extension);
                if (agent) {
                    d.extension = `${agent.AgentExtension} - ${agent.AgentName}`;
                }
            });

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

        const columns = [
            {
                dataField: 'dialing_status_id',
                text: '',
                formatter: (cell, row) => <div style={{ fontSize: 10, padding: 0, lineHeight: "20px", fontWeight: "bold", color: "#ffffff", display: "inline-block", backgroundColor: this.getColor(_.find(this.props.leadstatus, ['statuscode', row.dialing_status_id]).colorcode), width: 20, height: 20, borderRadius: 3, }}>{row.attempt}</div>,
                classes: (cell, row) => {
                    return `text-center`
                },
                headerStyle: {
                    width: 40,
                    padding: 0
                },
            },
            {
                dataField: 'id',
                text: 'ID',
                headerStyle: {
                    width: 80
                },
            }, {
                dataField: 'number',
                text: 'Phone #',
                headerStyle: {
                    width: 100
                },
            }, {
                dataField: 'uploaded_on',
                text: 'Uploaded On',
                headerStyle: {
                    width: 140
                },
                formatter: (cell) => {
                    if (cell) {
                        const dateObj = new Date(cell);
                        const year = dateObj.getFullYear().toString().slice(-2);
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
                    } else {
                        return "";
                    }
                }
            },
            {
                dataField: 'dialed_on',
                text: 'Last Dialed On',
                headerStyle: {
                    width: 140
                },
                formatter: (cell) => {
                    if (cell) {
                        const dateObj = new Date(cell);
                        const year = dateObj.getFullYear().toString().slice(-2);
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
                    } else {
                        return "";
                    }
                }

            }, {
                dataField: 'extension',
                text: 'Agent',
                formatter: (cell, row) => {
                    let agent = agents.find(agent => agent.AgentExtension === cell);
                    if (agent) {
                        return `${agent.AgentExtension} - ${agent.AgentName}`;
                    } else {
                        return '';
                    }
                }
            },

            ...custom_fields,
            {
                dataField: 'extension_id',
                text: '',
                headerStyle: {
                    width: 80
                },
                formatter: (cellContent, row) => {
                    return (
                        <div className="d-flex justify-content-around" >
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
                            <CSVLink data={data} headers={headers} filename={"leads.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                            {/* <Link className="btn" to="/leads/dial"><i className="fa fa-search"></i> Search Leads</Link> */}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <FilterReport filters={this.state.filters} leadstatus={leadstatus} isCampaignLead={true} data={facilities} sendData={this.getData} onFiltered={(data, filters) => this.changeFilter(data, filters)} />
                        <Card className="flex-grow-1">
                            <CardHeader>
                                {this.state.filters.campaign && this.state.filters.campaign.campaign_name ? `[${this.state.filters.campaign.campign_id}] ${this.state.filters.campaign.campaign_name}` : ""}
                                {/* <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a> */}
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
                                                        {facilities ? facilities.length ? <BootstrapTable wrapperClasses="table-responsive" pagination={paginationFactory({ hideSizePerPage: true })} keyField='id' data={facilities} columns={columns} /> : "No records found" : "Please generate the report"}
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

function mapStateToProps({ facilities, leadstatus, field_layout, campaigns, agents }) {
    return {
        facilities,
        leadstatus,
        field_layout,
        campaigns,
        agents
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadFacilities,
        loadLeadStatuses,
        deleteFacility,
        loadCustomFields,
        loadCampaigns,
        loadAgents
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);