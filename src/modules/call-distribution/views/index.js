import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { flattenArray, formatCurrency, formatDuration, formatMSecondsToTime, formatTimeToSeconds, removeMilliseconds } from '../../../config/util';
import CreateReport from './create';
import Table from './table';

class CallDistribution extends Component {
    getReportData(input) {

        if (!Array.isArray(input)) {
            return { input: null, headers: null };
        }
        console.log("in", input)
        let scale = "";
        let start; let len;
        if (input.length === 31) {
            scale = "Date"
            start = 0
            len = 10
        }
        if (input.length === 24) {
            scale = "Hour"
            start = 11
            len = 8
        }

        if (input.length === 12) {
            scale = "Month"
            start = 0
            len = 7
        }
        const headers = [
            { label: scale, key: scale },
            { label: 'Inbound Total Calls', key: 'Inbound Total Calls' },
            { label: 'Inbound Answered', key: 'Inbound Answered' },
            { label: 'Inbound Answered Within SLA', key: 'Inbound Answered Within SLA' },
            { label: 'Inbound Service Level %', key: 'Inbound Service Level %' },
            { label: 'Inbound Abandoned Calls count', key: 'Inbound Abandoned Calls count' },
            { label: 'Inbound Abandoned Calls %', key: 'Inbound Abandoned Calls %' },
            { label: 'Inbound Abandoned Within SLA', key: 'Inbound Abandoned Within SLA' },
            { label: 'Inbound AWT Answered', key: 'Inbound AWT Answered' },
            { label: 'Inbound AWT Abandoned', key: 'Inbound AWT Abandoned' },
            { label: 'Inbound AWT Total', key: 'Inbound AWT Total' },
            { label: 'Inbound Average Answering Speed', key: 'Inbound Average Answering Speed' },
            { label: 'Inbound Ans. AHT', key: 'Inbound Ans. AHT' },
            { label: 'Inbound Unans. AHT', key: 'Inbound Unans. AHT' },
            { label: 'Inbound Average Hold Time', key: 'Inbound Average Hold Time' },
            { label: 'Inbound Average Talking Time', key: 'Inbound Average Talking Time' },

            { label: 'Outbound Total Calls', key: 'Outbound Total Calls' },
            { label: 'Outbound Answered', key: 'Outbound Answered' },
            { label: 'Outbound Unanswered', key: 'Outbound Unanswered' },
            { label: 'Outbound Ans. AHT', key: 'Outbound Ans. AHT' },
            { label: 'Outbound Unans. AHT', key: 'Outbound Unans. AHT' },
            { label: 'Outbound Average Hold Time', key: 'Outbound Average Hold Time' },
            { label: 'Outbound Average Talking Time', key: 'Outbound Average Talking Time' },

            { label: 'Total Ans. AHT', key: 'Total Ans. AHT' },
            { label: 'Total Unans. AHT', key: 'Total Unans. AHT' },
            { label: 'Total Average Hold Time', key: 'Total Average Hold Time' },
            { label: 'Total Average Talking Time', key: 'Total Average Talking Time' },
        ];

        const data = input.map(item => {
            const row = {};

            let AWT_answered = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_waiting_answered) / item.inbound_answered));
            let AWT_abandoned = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_waiting_unanswered) / item.inbound_unanswered));
            let AWT_total = formatDuration(formatCurrency((formatTimeToSeconds(item.sum_waiting_answered) + formatTimeToSeconds(item.sum_waiting_unanswered)) / (item.inbound_answered + item.inbound_unanswered)));
            //average answering speed = sum_ringing_answered / inbound_answered
            let inbound_avg_ans_speed = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_ringing_answered) / item.inbound_answered));
            //average answered handling time = (taking + wrap) / answered
            let inbound_avg_ans_ht = formatDuration((formatTimeToSeconds(item.sum_talking_inbound) + formatTimeToSeconds(item.sum_wrap_inbound_answered)) / item.inbound_answered);
            let outbound_avg_ans_ht = formatDuration((formatTimeToSeconds(item.sum_talking_outbound) + formatTimeToSeconds(item.sum_wrap_outbound_answered)) / item.outbound_answered);
            let total_avg_ans_ht = formatDuration(
                ((formatTimeToSeconds(item.sum_talking_inbound) + formatTimeToSeconds(item.sum_wrap_inbound_answered)) +
                    (formatTimeToSeconds(item.sum_talking_outbound) + formatTimeToSeconds(item.sum_wrap_outbound_answered))) /
                (item.inbound_answered + item.outbound_answered)
            );

            //average unanswered handling time = (unasnwered wrap) / unanswered
            let inbound_avg_unans_ht = formatDuration(formatTimeToSeconds(item.sum_wrap_inbound_unanswered) / item.inbound_unanswered)
            let outbound_avg_unans_ht = formatDuration(formatTimeToSeconds(item.sum_wrap_outbound_unanswered) / item.outbound_unanswered);
            let total_avg_unans_ht = formatDuration(
              ((formatTimeToSeconds(item.sum_wrap_inbound_unanswered)) + formatTimeToSeconds(item.sum_wrap_outbound_unanswered)) /
              (item.inbound_unanswered + item.outbound_unanswered)
            );
            //average hold time = sum_hold_time / answered calls
            let inbound_avg_hold_time = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_hold_inbound) / item.inbound_answered))
            let outbound_avg_hold_time = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_hold_outbound) / item.outbound_answered))
            let total_avg_hold_time = formatDuration(
              (formatTimeToSeconds(item.sum_hold_inbound) + formatTimeToSeconds(item.sum_hold_outbound)) /
              (item.inbound_answered + item.outbound_answered)
            );
            //average talking time = (sum_talking_time) / answered calls
            let inbound_avg_tt = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_talking_inbound) / item.inbound_answered))
            let outbound_avg_tt = formatDuration(formatCurrency(formatTimeToSeconds(item.sum_talking_outbound) / item.outbound_answered))
            let total_avg_tt = formatDuration(
              (formatTimeToSeconds(item.sum_talking_inbound) +
                formatTimeToSeconds(item.sum_talking_outbound)) /
              (item.inbound_answered + item.outbound_answered)
            );

            row[scale] = item.time_period.substr(start, len);
            row["Inbound Total Calls"] = item.inbound_total;
            row["Inbound Answered"] = item.inbound_answered;
            row["Inbound Answered Within SLA"] = item.inbound_answered_within_sla;
            row["Inbound Service Level %"] = formatCurrency(item.inbound_answered_within_sla / item.inbound_total * 100);
            row["Inbound Abandoned Calls count"] = item.inbound_unanswered;
            row["Inbound Abandoned Calls %"] = formatCurrency(item.inbound_unanswered / (item.inbound_total) * 100);
            row["Inbound Abandoned Within SLA"] = item.inbound_unanswered_within_sla;
            row["Inbound AWT Answered"] = AWT_answered != "00:00:00" ? AWT_answered : "-";
            row["Inbound AWT Abandoned"] = AWT_abandoned != "00:00:00" ? AWT_abandoned : "-";
            row["Inbound AWT Total"] = AWT_total != "00:00:00" ? AWT_total : "-";
            row["Inbound Average Answering Speed"] = inbound_avg_ans_speed != "00:00:00" ? inbound_avg_ans_speed : "-";
            row["Inbound Ans. AHT"] = inbound_avg_ans_ht != "00:00:00" ? inbound_avg_ans_ht : "-";
            row["Inbound Unans. AHT"] = inbound_avg_unans_ht != "00:00:00" ? inbound_avg_unans_ht : "-";
            row["Inbound Average Hold Time"] = inbound_avg_hold_time != "00:00:00" ? inbound_avg_hold_time : "-";
            row["Inbound Average Talking Time"] = inbound_avg_tt != "00:00:00" ? inbound_avg_tt : "-";

            row["Outbound Total Calls"] = item.outbound_total;
            row["Outbound Answered"] = item.outbound_answered;
            row["Outbound Unanswered"] = item.outbound_unanswered;
            row["Outbound Ans. AHT"] = outbound_avg_ans_ht != "00:00:00" ? outbound_avg_ans_ht : "-";
            row["Outbound Unans. AHT"] = outbound_avg_unans_ht != "00:00:00" ? outbound_avg_unans_ht : "-";
            row["Outbound Average Hold Time"] = outbound_avg_hold_time != "00:00:00" ? outbound_avg_hold_time : "-";
            row["Outbound Average Talking Time"] = outbound_avg_tt != "00:00:00" ? outbound_avg_tt : "-";

            row["Total Ans. AHT"] = total_avg_ans_ht != "00:00:00" ? total_avg_ans_ht : "-";
            row["Total Unans. AHT"] = total_avg_unans_ht != "00:00:00" ? total_avg_unans_ht : "-";
            row["Total Average Hold Time"] = total_avg_hold_time != "00:00:00" ? total_avg_hold_time : "-";
            row["Total Average Talking Time"] =total_avg_tt != "00:00:00" ? total_avg_tt : "-";
            return row;
        });


        return { headers, data };
    }



    render() {
        const { data, headers } = this.getReportData(this.props.call_distribution);
        return (

            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Call Distribution Report</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {this.props.call_distribution ? <CSVLink data={data} headers={headers} filename={"call-distribution.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3" style={{ width: 300, flexShrink: 0 }}>
                            <Card>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport />
                            </Card>
                        </div>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <Table />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ call_distribution }) {
    return {
        call_distribution
    };
}
export default connect(mapStateToProps, null)(CallDistribution);