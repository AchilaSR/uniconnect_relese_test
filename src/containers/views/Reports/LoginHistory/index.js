import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';

import ActivityTable from './table';
import { getReportData } from '../../../../config/util';

class LoginHistory extends Component {
    render() {
        const { data } = getReportData(this.props.login_history);

        const headers = [
            {
                key: "agent_extension",
                label: "Extension"
            },
            {
                key: "agent_name",
                label: "Agent Name"
            },
            {
                key: "login_time",
                label: "Login Time"
            },
            {
                key: "last_active_time",
                label: "Last activity Time"
            },
            {
                key: "duration",
                label: "Duration"
            }
        ];


        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Login History</li>
                    {data ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={"login-history.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <CreateReport />
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <ActivityTable />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ login_history }) {
    return {
        login_history,
    };
}
export default connect(mapStateToProps, null)(LoginHistory);