import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';

import ReportChart from './table';
import { getReportData } from '../../../../config/util';

class CallDetails extends Component {
    render() {
        const { data, headers } = getReportData(this.props.call_details);

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Call Details</li>
                    {this.props.call_details ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={`call-details.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateReport />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <ReportChart />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ call_details }) {
    return {
        call_details,
    };
}
export default connect(mapStateToProps, null)(CallDetails);

