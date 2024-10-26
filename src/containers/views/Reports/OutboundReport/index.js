import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Table } from 'reactstrap';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import Loader from '../../../../components/Loader';
import { CSVLink } from 'react-csv';
import { flattenArray, getReportData } from '../../../../config/util';
import CreateReport from './create';

class OutboundReport extends Component {
    render() {
        const { outbound_report } = this.props;

        let data;
        let periods;
        let report_data;
        let headers;

        if (outbound_report) {
            data = outbound_report.data;
            periods = outbound_report.periods;

            const rpt = getReportData(flattenArray(Object.values(data)));
            report_data = rpt.data;
            headers = rpt.headers;
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Outbound Report</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {report_data ? <CSVLink data={report_data} headers={headers} filename={"outbound_report.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3" style={{ width: 300, flexShrink: 0 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateReport />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>

                                {outbound_report ?
                                    <div className="sticky-table">
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    <th style={{ zIndex: 3 }} rowSpan="2">Agent</th>
                                                    <th rowSpan="2">Extension</th>
                                                    {
                                                        periods.map((a) => (<th className="text-center" key={a} colSpan="2">{a}</th>))
                                                    }
                                                </tr>
                                                <tr>
                                                    {periods.map((p) => {
                                                        return ["Answered", "Unanswered"].map((a) => (<th className="text-center" key={`${p}-${a}`} style={{ minWidth: 100, maxWidth:100 }}>{a}</th>))
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Object.values(data).map((agent) => {
                                                        return <tr>
                                                            <th>{agent.agentName}</th>
                                                            <th>{agent.extension}</th>
                                                            {periods.map((p) => {
                                                                return ["Answered", "Unanswered"].map((a) => (<td className="text-right" >{agent[p] ? agent[p][a] : 0}</td>))
                                                            })}
                                                        </tr>
                                                    })}
                                            </tbody>
                                        </Table>
                                    </div> : "Please generate the report"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ outbound_report }) {
    return {
        outbound_report,
    };
}
export default connect(mapStateToProps, null)(OutboundReport);