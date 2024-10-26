import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Table } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { formatCurrency, formatDuration, getReportData } from '../../../../config/util';
import _ from 'lodash';
import { CUSTOM } from '../../../../custom';
import { CAMPAIGN_ALLOW_DUPLICATE_CONTENT } from '../../../../config/globals';


class CampaignSummary extends Component {

    renderRows() {
        const { campaign_summary } = this.props;

        const groupedSummary = _.groupBy(campaign_summary, 'campaign_id');

        return Object.keys(groupedSummary).map(campaignId => {
            const rows = groupedSummary[campaignId];

            return rows.map((row, index) => (
                <tr key={`${campaignId}-${row.group_date}`} style={{ verticalAlign: "top" }}>
                    {index === 0 && (
                        <>
                            <th style={{ verticalAlign: "top" }} rowSpan={rows.length}>[{campaignId}] {row.list}</th>
                            <td style={{ verticalAlign: "top" }} rowSpan={rows.length}>{row.service}</td>
                            <td style={{ verticalAlign: "top" }} rowSpan={rows.length}>{row.started_on}</td>
                            <td style={{ verticalAlign: "top" }} rowSpan={rows.length}>{row.campaign_status === 1 ? "" : row.ended_on}</td>
                            <td style={{ verticalAlign: "top" }} rowSpan={rows.length} className='text-right'>{row.list_count}</td>
                            <td style={{ verticalAlign: "top" }} rowSpan={rows.length} className='text-right'>{row.dnc_count}</td>
                        </>
                    )}
                    <td style={{ textAlign: 'right' }}>{row.group_date}</td>
                    {CAMPAIGN_ALLOW_DUPLICATE_CONTENT &&
                        <>
                            <td style={{ textAlign: 'right' }}>{row.upload_count}</td>
                        </>}
                    <td style={{ textAlign: 'right' }}>{row.total_dialed_count}</td>
                    <td style={{ textAlign: 'right' }}>{row.total_answered_count}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.total_answered_count / row.total_dialed_count * 100)}</td>
                    <td style={{ textAlign: 'right' }}>{row.total_unanswered_count}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.total_unanswered_count / row.total_dialed_count * 100)}</td>
                    <td style={{ textAlign: 'right' }}>{row.unique_dialed_count}</td>
                    <td style={{ textAlign: 'right' }}>{row.unique_answered_count}</td>
                    <td style={{ textAlign: 'right' }}>{row.unique_dialed_count - row.unique_answered_count}</td>
                    <td style={{ textAlign: 'right' }}>{formatDuration(row.total_talk_time)}</td>
                    <td style={{ textAlign: 'right' }}>{formatDuration(row.total_hold_time)}</td>
                    <td style={{ textAlign: 'right' }}>{formatDuration(row.total_talk_time / row.total_answered_count)}</td>
                    <td style={{ textAlign: 'right' }}>{formatDuration((row.total_talk_time + (row.total_wrap_time ? row.total_wrap_time : 0)) / row.unique_dialed_count)}</td>
                </tr>
            ));
        });
    }

    render() {
        const { campaign_summary } = this.props;
        let { data } = getReportData(campaign_summary);


        if (data) {
            data = data.map(row => ({
                ...row,
                list: `[${row.campaign_id}] ${row.list}`,
                average_handle_time: formatDuration((row.total_talk_time + (row.total_wrap_time ? row.total_wrap_time : 0)) / row.unique_dialed_count),
                average_talk_time: formatDuration(row.total_talk_time / row.total_answered_count),
                unique_unanswered_count: row.unique_dialed_count - row.unique_answered_count,
                answered_percentage: ((row.unique_answered_count / row.list_count) * 100).toFixed(2) + '%',
                unanswered_percentage: (((row.unique_dialed_count - row.unique_answered_count) / row.list_count) * 100).toFixed(2) + '%',
                total_talk_time: formatDuration(row.total_talk_time),
                total_hold_time: formatDuration(row.total_hold_time),
                ended_on: row.campaign_status === 1 ? "" : row.ended_on
            }));
        }

        let headers = CUSTOM.REPORT_HEADERS && CUSTOM.REPORT_HEADERS.CAMPAIGN_SUMMARY ? CUSTOM.REPORT_HEADERS.CAMPAIGN_SUMMARY : [
            { key: "list", label: "Campaign Name" },
            { key: "service", label: "Queue" },
            { key: "started_on", label: "Started On" },
            { key: "ended_on", label: "Ended On" },
            { key: "list_count", label: "List Count" },
            { key: "dnc_count", label: "DNC Count" },
            { key: "group_date", label: "Interval" },
            ...(CAMPAIGN_ALLOW_DUPLICATE_CONTENT ? [
                { key: "upload_count", label: "Uploaded Count" }
            ] : []),
            { key: "total_dialed_count", label: "Dial Count" },
            { key: "total_answered_count", label: "Answered Count" },
            { key: "answered_percentage", label: "Answered %" },
            { key: "total_unanswered_count", label: "Unans. Count" },
            { key: "unanswered_percentage", label: "Unans %" },
            { key: "unique_dialed_count", label: "Unique Dialed Count" },
            { key: "unique_answered_count", label: "Unique Answered Count" },
            { key: "unique_unanswered_count", label: "Unique Unans. Count" },
            { key: "total_talk_time", label: "Total Talk Time" },
            { key: "total_hold_time", label: "Total Hold Time" },
            { key: "average_talk_time", label: "Avg. Talk Time" },
            { key: "average_handle_time", label: "Avg. Handle Time" },
        ];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Campaign Summary Report</li>
                    {data && (
                        <li className="breadcrumb-menu">
                            <div className="btn-group">
                                <CSVLink data={data} headers={headers} filename={"campaign_summary.csv"}>
                                    <a className="btn"><i className="fa fa-download"></i> Download CSV</a>
                                </CSVLink>
                            </div>
                        </li>
                    )}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3 flex-shrink-0" style={{ width: 300 }}>
                            <Card>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport />
                            </Card>
                        </div>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                {campaign_summary ? (
                                    campaign_summary.length ? (
                                        <div className="sticky-table">
                                            <Table style={{ backgroundColor: "#ffffff" }} className='activity-summary' size='sm' bordered>
                                                <thead>
                                                    <tr>
                                                        <th style={{ minWidth: 120 }}>Campaign Name</th>
                                                        <th style={{ minWidth: 120 }}>Queue</th>
                                                        <th style={{ minWidth: 125 }}>Started On</th>
                                                        <th style={{ minWidth: 125 }}>Ended On</th>
                                                        <th style={{ minWidth: 70 }}>List Count</th>
                                                        <th style={{ minWidth: 70 }}>DNC Count</th>
                                                        <th style={{ minWidth: 125 }}>Interval</th>
                                                        {CAMPAIGN_ALLOW_DUPLICATE_CONTENT &&
                                                            <>
                                                                <th style={{ minWidth: 70 }}>Uploaded Count</th>
                                                            </>}
                                                        <th style={{ minWidth: 70 }}>Dialed Count</th>
                                                        <th style={{ minWidth: 70 }}>Answered Count</th>
                                                        <th style={{ minWidth: 70 }}>Answered %</th>
                                                        <th style={{ minWidth: 70 }}>Unans. Count</th>
                                                        <th style={{ minWidth: 70 }}>Unans %</th>
                                                        <th style={{ minWidth: 70 }}>Unique Dialed Count</th>
                                                        <th style={{ minWidth: 70 }}>Unique Answered Count</th>
                                                        <th style={{ minWidth: 70 }}>Unique Unans. Count</th>
                                                        <th style={{ minWidth: 70 }}>Total Talk Time</th>
                                                        <th style={{ minWidth: 70 }}>Total Hold Time</th>
                                                        <th style={{ minWidth: 70 }}>Avg. Talk Time</th>
                                                        <th style={{ minWidth: 70 }}>Avg. Handle Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.renderRows()}
                                                </tbody>
                                            </Table>
                                        </div>
                                    ) : "No records found"
                                ) : "Please generate the report"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ campaign_summary }) {
    return {
        campaign_summary,
    };
}

export default connect(mapStateToProps, null)(CampaignSummary);
