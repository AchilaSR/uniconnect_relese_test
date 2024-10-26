import React, { Component } from 'react';
import { Card, CardHeader, CardBody, NavItem, NavLink } from 'reactstrap';
import CreateReport from './create';
import Fullscreen from "react-full-screen";
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';

import ActivityTable from './table';
import KPIChart from './chart';
import { SHOW_ADHERENCE, SHOW_WRAP_TIME } from '../../../../config/globals';

class ActivityReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTable: true,
            isFull: false
        };
    }

    goFull = () => {
        this.setState({ isFull: true });
    }

    getReportData(input) {
        if (input.length === 0) {
            return { data: null, headers: null };
        }

        const data = [];
        const headers = [
            { label: 'ID', key: 'agent_id' },
            { label: 'Extention', key: 'agentExtension' },
            { label: 'Name', key: 'agentName' }
        ];

        if (input[0].campaign) {
            headers.push({ label: 'Campaign', key: 'campaign' });
            headers.push({ label: 'Queue', key: 'queue' });
        }

        input[0].Data.map(({ status_id, statusName }) => {
            if (!SHOW_WRAP_TIME && status_id === 7) {
                return null;
            }
            return (
                ["Duration", "Count"].map(val => {
                    return headers.push({
                        label: val + " " + statusName,
                        key: val + status_id
                    });
                })
            );
        });

        if (!input[0].campaign) {
            if (SHOW_ADHERENCE) {
                headers.push({ label: 'Adherence', key: 'adherence' });
            }
            headers.push({ label: 'First Login Time', key: 'firstLoginTime' });
            headers.push({ label: 'Last Active Time', key: 'lastLogoutTime' });
        }

        headers.push({ label: 'Total Duration', key: 'totalDuration' });
        headers.push({ label: 'Total Count', key: 'totalCount' });

        input.map(({ agent_id, agentExtension, agentName, campaign, firstLoginTime, lastLogoutTime, Data }) => {
            const row = { agent_id, agentExtension, agentName, firstLoginTime, lastLogoutTime };
            if (campaign) {
                row.campaign = campaign.campaign_name;
                row.queue = campaign.outbound_queue;
            }
            var totalCount = 0;
            var totalDuration = 0;

            Data.map(status => {
                row["Duration" + status.status_id] = status.totalDuration;
                row["Count" + status.status_id] = status.totalCount;
                if (status.statusName !== "Login") {
                    totalCount += status.totalCount;
                    totalDuration += status.totalDuration;
                }
                return null;
            });
            row.adherence = (totalDuration - row["Duration" + 5] - row["Duration" + 7]) / (totalDuration - row["Duration" + 5]);
            row.totalCount = totalCount;
            row.totalDuration = totalDuration;
            data.push(row);
            return null;
        });

        return { data, headers };
    }

    render() {
        const { data, headers } = this.getReportData(this.props.agent_activity_report);
        const isCampaign = _.find(headers, { key: 'campaign' });
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Agent Activity</li>
                    {this.props.agent_activity_report.length ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {
                                this.state.isTable ?
                                    <a className="btn" onClick={() => this.setState({ isTable: !this.state.isTable })}><i className="fa fa-bar-chart"></i> Show Chart</a> :
                                    <a className="btn" onClick={() => this.setState({ isTable: !this.state.isTable })}><i className="fa fa-table"></i> Show Table</a>
                            }
                            <CSVLink data={data} headers={headers} filename={"agent-activity-report.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                            <a className="btn" onClick={this.goFull}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <CreateReport />
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <Fullscreen
                                    enabled={this.state.isFull}
                                    onChange={isFull => this.setState({ isFull })}
                                    className="bg-light"
                                >
                                    <div className="bg-white">
                                        {this.state.isTable ? <ActivityTable showLogin={!isCampaign} showAdherence={!isCampaign && SHOW_ADHERENCE} /> : <KPIChart />}
                                    </div>
                                </Fullscreen>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ agent_activity_report }) {
    return {
        agent_activity_report,
    };
}
export default connect(mapStateToProps, null)(ActivityReport);