import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateGroup from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';

import KPITable from './table';


class KPIReports extends Component {
    getReportData(input) {
        if (!input) {
            return { data: null, headers: null };
        }

        const data = [];
        const headers = [
            { label: 'Hour', key: 'hour' }
        ];

        input.result[0].stats.map(({ date }) => {
            headers.push({ label: `Answered in ${date}`, key: `answered-${date}` });
            headers.push({ label: `Answered within SLA ${date}`, key: `answered-sla-${date}` });
            headers.push({ label: `Unanswered in ${date}`, key: `unanswered-${date}` });
            return null;
        });

        input.result.map(({ hour, stats }) => {
            const row = { hour };
            stats.map(({ date, answered, unanswered, answered_sla }) => {
                row['answered-' + date] = answered;
                row['answered-sla-' + date] = answered_sla;
                row[`unanswered-${date}`] = unanswered;
                return null;
            });
            data.push(row);
            return null;
        });

        return { data, headers };
    }

    render() {
        const { data, headers } = this.getReportData(this.props.queue_statistics);

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Queue Statistics</li>
                    {this.props.queue_statistics && this.props.queue_statistics.result ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={`queue-statistics-${this.props.queue_statistics.query.queues.join("-")}.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateGroup />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <KPITable />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ queue_statistics }) {
    return {
        queue_statistics,
    };
}
export default connect(mapStateToProps, null)(KPIReports);

