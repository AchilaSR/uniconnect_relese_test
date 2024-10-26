import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateReport from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { checkPermission, getReportData } from '../../../config/util';
import { loadReports, deleteReport } from '../../../actions/reports';
import { CSVLink } from 'react-csv';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';
import moment from 'moment';
import { CUSTOM } from '../../../custom';

class DispositionReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            readAccess: false,
            writeAccess: false
        };
    }

    componentWillMount() {
        this.setState({ readAccess: checkPermission('Reports', 'READ') });
        this.setState({ writeAccess: checkPermission('Reports', 'WRITE') });
    }

    render() {
        let { dispostion_reports } = this.props;
        const self = this;
        let data, headers;

        //TODO: Remove this once the duplicate dispsition report fix is done from the backend
        if (dispostion_reports && dispostion_reports.length > 0) {
            dispostion_reports = dispostion_reports.filter(a => a.disposition_data).map(a => {
                delete a.campaign_id;
                delete a.dialing_status_id;
                delete a.next_follow_up_on;
                delete a.extension_id;
                delete a.disposition;
                delete a.history_disposition;
                delete a.cf_testfield;
                delete a.followup_note;

                return a;
            });
        }

        if (dispostion_reports && dispostion_reports.length > 0) {
            const report_data = getReportData(dispostion_reports.map((a) => {
                if (typeof a.disposition_data === "object") {
                    if (a.disposition_data.data) {
                        const d = {}

                        let data = {};
 
                        if(a.ui_schema!=""){
                            let obj = JSON.parse(a.ui_schema);

                            if (Array.isArray(obj['ui:order'])) {
                                a.disposition_data.data.forEach(item => {
                                    let key = item[0];
                                    let value = item[1];
                                    data[key] = value;
                                });
        
                                obj['ui:order'].forEach((item, index) => {
                                    d[item] = data[item] ? data[item]: "";
                                });
                            }else{
                                a.disposition_data.data.forEach(([key, value]) => d[key] = value);
                            }

                            
                        }else{
                            
                        }
                        
         
                        a = { ...a, ...d };
                    } else {
                        a = { ...a, ...a.disposition_data };
                    }
                    delete a.disposition_data;
                    delete a.id;
                    delete a.ui_schema
                }
                return a
            }));

            data = report_data.data;
            headers = CUSTOM.REPORT_HEADERS && CUSTOM.REPORT_HEADERS.DISPOSITION_REPORT ? [...CUSTOM.REPORT_HEADERS.DISPOSITION_REPORT, ...report_data.headers.filter(a => a.key.startsWith("cf_"))] : report_data.headers;
        }

        const columns = [{
            dataField: 'lead_id',
            text: 'Lead ID',
            hidden: true
        }, {
            dataField: 'number',
            text: 'Number'
        }, {
            dataField: 'outbound_service',
            text: 'Queue',
            hidden: true
        }, {
            dataField: 'campaign_name',
            text: 'Campaign Name',
            hidden: true
        }, {
            dataField: 'lead_status',
            text: 'Status',
        }, {
            dataField: 'dialed_on',
            text: 'Dialed On',
            formatter: (cell) => {
                if (cell)
                    return moment(cell).format("YYYY-MM-DD HH:mm:ss")
            }
        }, {
            dataField: 'addedon',
            text: 'Added On',
            formatter: (cell) => {
                return moment(cell).format("YYYY-MM-DD HH:mm:ss")
            }
        }, {
            dataField: 'agent',
            text: 'Agent',
        }, {
            dataField: 'attempt',
            text: 'Attempt',
        }];

        if (headers) {
            headers.forEach(a => {
                if (a.key.substr(0, 3) === "cf_") {
                    columns.push({
                        dataField: a.key,
                        text: a.label,
                        hidden: true
                    });
                }
            })
        }

        const CustomToggleList = ({
            columns,
            onColumnToggle,
            toggles
        }) => (
            <div>
                {
                    columns
                        .map(column => ({
                            ...column,
                            toggle: toggles[column.dataField]
                        }))
                        .map(column => {
                            if (column.text) {
                                return <FormGroup key={column.dataField} check>
                                    <Label check>
                                        <Input checked={column.toggle} onClick={() => onColumnToggle(column.dataField)} type="checkbox" id="checkbox2" />{' '}
                                        {column.text}
                                    </Label>
                                </FormGroup>
                            } else {
                                return undefined;
                            }
                        })
                }
            </div>
        );

        if (DYNAMIC_DISPOSITION_FORMS) {
            columns.push({
                dataField: 'disposition_data',
                text: 'Disposition Data',
                formatter: (cell) => {
                    if (typeof cell === "object") {
                        if (cell.data) {
                            return <ul className='form-list'>
                                {cell.data.map(([key, value]) => value ? <li><label>{key}</label> {typeof value === "object" ? JSON.stringify(value) : value}</li> : "")}
                            </ul>
                        } else {
                            let data = JSON.stringify(cell);
                            // data = data.split(',').join(<br />)
                            return data;
                        }
                    }
                    return cell;
                }
            });
        } else {
            columns.push({
                dataField: 'disposition',
                text: 'Disposition',
            });
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Report</li>
                    {data ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {<CSVLink data={data} headers={headers} filename={"disposition_report.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>}
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <Card>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport />
                            </Card>
                        </div>
                        <div className="flex-grow-1">
                            <Card>
                                <CardHeader>
                                    Report
                                    {dispostion_reports && dispostion_reports.length > 0 ? <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a> : ""}
                                </CardHeader>
                                <CardBody>
                                    {dispostion_reports && dispostion_reports.length > 0 ?
                                        <ToolkitProvider
                                            keyField="id"
                                            data={dispostion_reports}
                                            columns={columns}
                                            columnToggle
                                        >{
                                                props =>
                                                    <Row>
                                                        <Col xs={this.state.showLegend ? 10 : 12}>
                                                            <BootstrapTable wrapperClasses="table-responsive" pagination={paginationFactory({ hideSizePerPage: true })} keyField='id'  {...props.baseProps} />
                                                        </Col>
                                                        {
                                                            this.state.showLegend ?
                                                                <Col xs="2">
                                                                    <CustomToggleList btnClassName="btn-outline" {...props.columnToggleProps} />
                                                                </Col> : ""}
                                                    </Row>}</ToolkitProvider> : "No data available"}
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ dispostion_reports }) {
    return {
        dispostion_reports
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadReports, deleteReport
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(DispositionReport));
