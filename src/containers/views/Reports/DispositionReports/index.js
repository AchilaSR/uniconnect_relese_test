import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateReport from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { checkPermission } from '../../../../config/util'
import { loadReports, deleteReport } from '../../../../actions/reports';
import { CSVLink } from 'react-csv';

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
        const { dispostion_report } = this.props;

        let columns = [];

        if (dispostion_report && dispostion_report.param_labels) {
            columns = Object.keys(dispostion_report.param_labels).sort(function (a, b) { return parseInt(a.split("_").pop()) - parseInt(b.split("_").pop()) }).map((dataField, index) => ({
                dataField,
                text: dispostion_report.param_labels[dataField],
                hidden: index > 4,
                formatter: (cell) => {
                    if (typeof cell === "object") {
                        if (cell.data) {
                            return <ul className='form-list'>
                                {cell.data.map(([key, value]) => <li><label>{key}</label> {value}</li>)}
                            </ul>
                        } else {
                            let data = JSON.stringify(cell);
                            // data = data.split(',').join(<br />)
                            return data;
                        }
                    }
                    return cell;
                }
            }));
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

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Report</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {dispostion_report && dispostion_report.param_values.length ? <CSVLink data={dispostion_report.param_values.map((row) => {
                                Object.keys(row).forEach((key) => {
                                    if (typeof row[key] === "object") {
                                        if (row[key].data) {
                                            row[key] = row[key].data.map(([key, value]) => `${key}: ${value}`).join("\n")
                                        } else {
                                            row[key] = JSON.stringify(row[key])
                                        }
                                    }
                                })
                                return row;
                            })} headers={Object.keys(dispostion_report.param_labels).filter((a) => dispostion_report.param_labels[a].indexOf("Disposition Data") === -1).sort(function (a, b) { return parseInt(a.split("_").pop()) - parseInt(b.split("_").pop()) }).map((key) => ({ key, label: dispostion_report.param_labels[key] }))} filename={`disposition_report.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {
                            this.state.writeAccess &&
                            <div className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                                <Card>
                                    <CardHeader>Report Settings</CardHeader>
                                    <CreateReport />
                                </Card>
                            </div>
                        }
                        {
                            this.state.readAccess &&
                            <Card className="flex-grow-1">
                                <CardHeader>
                                    Report
                                    {columns.length ? <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a> : ""}
                                </CardHeader>
                                <CardBody>
                                    {
                                        dispostion_report && columns.length ?
                                            dispostion_report.param_values.length ?
                                                <ToolkitProvider
                                                    keyField="id"
                                                    data={dispostion_report.param_values.map((a, id) => ({ id, ...a }))}
                                                    columns={columns}
                                                    columnToggle
                                                >{
                                                        props =>
                                                            <Row>
                                                                <Col xs={this.state.showLegend ? 10 : 12}>
                                                                    <div style={{ position: "relative" }}>
                                                                        <BootstrapTable wrapperClasses="table-responsive" classes="mb-2" {...props.baseProps} pagination={paginationFactory({ hideSizePerPage: true })} />
                                                                    </div>
                                                                </Col>
                                                                {
                                                                    this.state.showLegend ?
                                                                        <Col xs="2">
                                                                            <CustomToggleList btnClassName="btn-outline" {...props.columnToggleProps} />
                                                                        </Col> : ""}
                                                            </Row>
                                                    }
                                                </ToolkitProvider> : "No records found"
                                            : "Please generate the report"}
                                </CardBody>
                            </Card>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ dispostion_report }) {
    return {
        dispostion_report
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadReports, deleteReport
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(DispositionReport));
