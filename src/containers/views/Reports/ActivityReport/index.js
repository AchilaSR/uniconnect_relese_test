import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { bindActionCreators } from 'redux';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { loadAgentActivities } from '../../../../actions/reports';

import ActivityTable from './table';
import { getReportData } from '../../../../config/util';

class ActivityReport extends Component {
    componentWillMount() {
        this.props.loadAgentActivities();
    }

    render() {
        const { data } = getReportData(this.props.agent_activity_logs);

        const headers = [
            {
                "key": "agent_name",
                "label": "Agent Name"
            },
            {
                "key": "agent_extension",
                "label": "Agent Extension"
            },
            {
                "key": "status_name",
                "label": "Status"
            },
            {
                "key": "sub_status_name",
                "label": "Sub Status"
            },
            {
                "key": "status_duration",
                "label": "Duration"
            },
            {
                "key": "requested_on",
                "label": "Time Stamp"
            }
        ]

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Agent Activity Report</li>
                    {data ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={"agent-activity-report.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
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


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgentActivities
    }, dispatch);
}


function mapStateToProps({ agent_activity_logs }) {
    return {
        agent_activity_logs,
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityReport);