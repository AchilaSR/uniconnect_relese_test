import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { bindActionCreators } from 'redux';
import Table from './table';
import { getReportData } from '../../../../config/util';

class PollingCalls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polling_attempts: []
        }
    }

    render() {
        const { data } = getReportData(this.state.polling_attempts);

        const headers = [
            {
                key: "queue",
                label: "Queues"
            },
            {
                key: "caller_num",
                label: "Caller Number"
            },
            {
                key: "caller_waiting_during",
                label: "Waiting Time"
            },
            {
                key: "caller_waiting_start",
                label: "Start Time"
            },
            {
                key: "caller_waiting_end",
                label: "End Time"
            },
            {
                key: "call_status",
                label: "Call Status"
            },
            {
                key: "agent_ext",
                label: "Agent Extension"
            },
            {
                key: "agent_name",
                label: "Agent Name"
            },
            {
                key: "ring_time",
                label: "Total Ring Time"
            },
            {
                key: "ring_start_time",
                label: "Ring Time Start"
            },
            {
                key: "ring_end_time",
                label: "Ring Time End"
            },
            {
                key: "fail_reason",
                label: "Polling Status"
            }

        ];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Polling Statistics</li>
                    {data ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={`polling-statistics.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <Card>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport onSubmit={(polling_attempts) => {
                                    this.setState({ polling_attempts })
                                }} />
                            </Card>
                        </div>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                {this.state.polling_attempts && this.state.polling_attempts.length > 0 ?
                                    <Table data={this.state.polling_attempts} /> : "No records found"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


export default PollingCalls;

