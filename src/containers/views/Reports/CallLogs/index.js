import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { bindActionCreators } from 'redux';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { loadAgentActivities } from '../../../../actions/reports';

import ActivityTable from './table';
import _ from 'lodash';

class CallLogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            call_logs: null
        }
    }

    getReportData(data) {

        if (!data || data.length === 0) {
            return { data: null, headers: null };
        }

        const uniqueKeys = new Set(data.flatMap(Object.keys));

        const headers = Array.from(uniqueKeys).map(key => ({ key, label: _.startCase(key) }));

        const keysData = ["call_id", "type", "start_time", "source_caller_id", "destination_caller_id", "destination_display_name", "source_display_name", "ringing_duration",
            "talking_duration", "answered_text"];

        const keysHeaders = [
            { "key": "call_id", "label": "Call ID" },
            { "key": "type", "label": "Type" },
            { "key": "start_time", "label": "Call Time" },
            { "key": "source_caller_id", "label": "Calling Party" },
            { "key": "destination_caller_id", "label": "Called Party" },
            { "key": "destination_display_name", "label": "Destination Display Name" },
            { "key": "source_display_name", "label": "Source Display Name" },
            { "key": "ringing_duration", "label": "Ring Time" },
            { "key": "talking_duration", "label": "Talk Time" },
            { "key": "answered_text", "label": "Status" },
        ];

        const filteredData = data.map(entry => {
            const filteredEntry = {};
            keysData.forEach(key => {
                if (entry[key] !== undefined) {
                    entry["answered_text"] = entry["answered"] ? "Answered" : entry["action_type"] === 5 ? "Unanswered - Queue Disconnected" : entry["action_type"] === 6 ? "Unanswered - Customer Disconnected" : "Unanswered";
                    filteredEntry[key] = entry[key];
                }
            });
            return filteredEntry;
        });


        const filteredHeaders = keysHeaders
            .filter(keyHeader => headers.some(header => header.key === keyHeader.key))
            .map(keyHeader => {
                const matchingHeader = headers.find(header => header.key === keyHeader.key);
                return matchingHeader ? { key: matchingHeader.key, label: keyHeader.label } : null;
            })
            .filter(header => header !== null);

        return { data, headers, filteredData, filteredHeaders };
    }

    render() {
        const { data, headers, filteredData, filteredHeaders } = this.getReportData(this.state.call_logs);

        // console.log("filteredData",data)
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Call Logs</li>
                    {this.state.call_logs && this.state.call_logs.length > 0 ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={filteredData} headers={filteredHeaders} filename={"call-logs.csv"} ><button className="btn"><i className="fa fa-download"></i> Download CSV</button></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <CreateReport onFiltered={(data) => this.setState({ call_logs: data })} />
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody className="scrollable-card">
                                <ActivityTable call_logs={this.state.call_logs} />
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
export default connect(mapStateToProps, mapDispatchToProps)(CallLogs);