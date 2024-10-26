import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';

import Table from './table';
import { getCallDataReport } from '../../../../actions/reports';
import { formatDispostionToString, formatTimeToSeconds, getReportData } from '../../../../config/util';
class CallData extends Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    filterReport(filter) {
        this.setState({ filter });
    }
    render() {
        const { duration, duration_filter } = this.state.filter || {};

        let filtered_data = this.props.call_data;
        const filter = this.state.filter;

        if (filtered_data && filtered_data.length && this.state.filter) {
            filtered_data = filtered_data.filter((a) => {
                const { call_type, answer_state } = this.state.filter;
                const callTypeValid = !call_type.length || call_type.includes(a.call_type);
                const answerStateValid = !answer_state.length || answer_state.includes(a.is_answered);
        
                return callTypeValid && answerStateValid;
            });
        }
        

        if (duration) {
            filtered_data = _.filter(filtered_data, (a) => {
                return a.talking_dur && eval(`${formatTimeToSeconds(a.talking_dur)} ${duration_filter} ${duration} `)
            });
        }

        const { data, headers } = getReportData(filtered_data);


        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Call Details</li>
                    {data ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data.map((a) => ({ ...a, disposition: formatDispostionToString(a.disposition), lead_details: formatDispostionToString(a.lead_details) }))} headers={headers} filename={`call-data.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateReport onReportFilter={(filter) => this.filterReport(filter)} />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                {filtered_data && filtered_data.length > 0 ?
                                    <Table data={filtered_data} /> : "No records found"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ call_data }) {
    return {
        call_data,
    };
}
export default connect(mapStateToProps, null)(CallData);

