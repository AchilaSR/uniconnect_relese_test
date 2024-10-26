import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { formatCurrency } from '../../../../config/util';
import Table from './table';
import { getReportData } from '../../../../config/util';

class AbandonedCalls extends Component {
    render() {
        const { data } = getReportData(this.props.abandoned_calls);

        const headers = [
            {
                key: "queue_name",
                label: "Queues"
            },
            {
                key: "inbound_calls",
                label: " Total Calls"
            },
            {
                key: "inbound_calls_answered",
                label: " Answered Calls"
            },
            {
                key: "inbound_answer_rate",
                label: " Answered %"
            },
            {
                key: "inbound_calls_unanswered",
                label: "Unanswered Total Calls"
            },
            {
                key: "inbound_calls_unanswered_percent",
                label: "Unanswered Percentage %"
            },
            {
                key: "inbound_calls_unanswered_after_5_sec",
                label: " Unasnwered >= 5 Sec"
            },
            {
                key: "inbound_calls_unanswered_after_5_sec_percent",
                label: "Unasnwered After 5 Sec %"
            },
            {
                key: "inbound_calls_unanswered_after_10_sec",
                label: "Unasnwered >= 10 Sec"
            },
            {
                key: "inbound_calls_unanswered_after_10_sec_percent",
                label: "Unasnwered After 10 Sec %"
            }
        ];
        
        let inbound_answer_rates = [];
        let inbound_calls_unanswered_percents = [];
        let inbound_calls_unanswered_after_5_sec_percents = [];
        let inbound_calls_unanswered_after_10_sec_percents = [];
        
        if (data && data.length > 0) {
            data.forEach(item => {
                const inbound_calls_answered = item.inbound_calls_answered;
                const inbound_calls = item.inbound_calls;
                const inbound_calls_unanswered = item.inbound_calls_unanswered;
                const inbound_calls_unanswered_after_5_sec = item.inbound_calls_unanswered_after_5_sec;
                const inbound_calls_unanswered_after_10_sec = item.inbound_calls_unanswered_after_10_sec;
        
                const answer_rate = formatCurrency(inbound_calls_answered / inbound_calls * 100);
                const unanswered_percent = formatCurrency(inbound_calls_unanswered / inbound_calls * 100);
                const unanswered_after_5_sec_percent = formatCurrency(inbound_calls_unanswered_after_5_sec / inbound_calls * 100);
                const unanswered_after_10_sec_percent = formatCurrency(inbound_calls_unanswered_after_10_sec / inbound_calls * 100);
        
                // inbound_answer_rates.push(answer_rate);
                // inbound_calls_unanswered_percents.push(unanswered_percent);
                // inbound_calls_unanswered_after_5_sec_percents.push(unanswered_after_5_sec_percent);
                // inbound_calls_unanswered_after_10_sec_percents.push(unanswered_after_10_sec_percent);

                item.inbound_answer_rate = answer_rate;
                item.inbound_calls_unanswered_percent=unanswered_percent;
                item.inbound_calls_unanswered_after_5_sec_percent=unanswered_after_5_sec_percent;
                item.inbound_calls_unanswered_after_10_sec_percent=unanswered_after_10_sec_percent;

            });
        } else {
            console.log(data);
        }
        
      
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Abandoned Calls</li>
                    {data ? <li className="breadcrumb-menu">
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
                                {this.props.abandoned_calls && this.props.abandoned_calls.length > 0 ?
                                    <Table /> : "No records found"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ abandoned_calls }) {
    return {
        abandoned_calls,
    };
}
export default connect(mapStateToProps, null)(AbandonedCalls);

