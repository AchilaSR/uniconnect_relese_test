import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Table } from 'reactstrap';
import { connect } from "react-redux";
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { getAgentCallStatisticsReport } from "../../../../actions/reports";
import Loader from '../../../../components/Loader';
import { CSVLink } from 'react-csv';

class ActivityReport extends Component {
    componentDidMount() {
        this.props.getAgentCallStatisticsReport();
    }

    getReportData(input) {
        if (input.length === 0) {
            return { data: null, headers: null };
        }
        const headers = [
            { label: 'Agent', key: 'agentName' },
            { label: 'Extension', key: 'extension' },
            { label: 'Daily Answered', key: 'daily_answered' },
            { label: 'Daily Unanswered', key: 'daily_unanswered' },
            { label: 'Daily Target', key: 'daily_target' },
            { label: 'Daily Percentage', key: 'daily_percentage' },
            { label: 'Weekly Answered', key: 'weekly_answered' },
            { label: 'Weekly Unanswered', key: 'weekly_unanswered' },
            { label: 'Monthly Answered', key: 'monthly_answered' },
            { label: 'Monthly Unanswered', key: 'monthly_unanswered' }
        ];

        return { data: input, headers };
    }

    render() {
        const { agent_call_counts } = this.props;
        const periods = ["Daily", "Weekly", "Monthly"];
        const totals = {
            daily_answered: 0,
            daily_unanswered: 0,
            daily_target: 0,
            weekly_answered: 0,
            weekly_unanswered: 0,
            monthly_answered: 0,
            monthly_unanswered: 0,
        }


        if (!agent_call_counts) {
            return <Loader />;
        }

        const { data, headers } = this.getReportData(agent_call_counts);

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Outbound Call Counts</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {this.props.agent_call_counts.length ? <CSVLink data={data} headers={headers} filename={"outbound_call_counts.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="flex-grow-1">
                            <CardHeader>Outbound Call Counts</CardHeader>
                            <CardBody>
                                <Table bordered>
                                    <thead>
                                        <tr>
                                            <th rowSpan="3">Agent</th>
                                            <th rowSpan="3">Extension</th>
                                            {
                                                periods.map((a) => (<th className="text-center" key={a} colSpan={a === "Daily" ? 4 : 2}>{a}</th>))
                                            }
                                        </tr>
                                        <tr>
                                            <th className="text-center" colSpan="4">{moment().format("DD-MMM-YYYY")}</th>
                                            <th className="text-center" colSpan="2">{moment().startOf('isoWeek').format("DD-MMM-YYYY")} to {moment().format("DD-MMM-YYYY")}</th>
                                            <th className="text-center" colSpan="2">{moment().startOf('month').format("DD-MMM-YYYY")} to {moment().format("DD-MMM-YYYY")}</th>
                                        </tr>
                                        <tr>
                                            {periods.map((p) => {
                                                if (p === "Daily") {
                                                    return ["Answered", "Unanswered", "Target", "Achivement"].map((a) => (<th className="text-center" key={`${p}-${a}`} style={{ width: 100 }}>{a}</th>));
                                                } else {
                                                    return ["Answered", "Unanswered"].map((a) => (<th className="text-center" key={`${p}-${a}`} style={{ width: 100 }}>{a}</th>))

                                                }
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agent_call_counts.map((agent) => {
                                            totals.daily_answered = totals.daily_answered + agent.daily_answered;
                                            totals.daily_unanswered = totals.daily_unanswered + agent.daily_unanswered;
                                            totals.daily_target = totals.daily_target + agent.daily_target;
                                            totals.weekly_answered = totals.weekly_answered + agent.weekly_answered;
                                            totals.weekly_unanswered = totals.weekly_unanswered + agent.weekly_unanswered;
                                            totals.monthly_answered = totals.monthly_answered + agent.monthly_answered;
                                            totals.monthly_unanswered = totals.monthly_unanswered + agent.monthly_unanswered;


                                            return <tr>
                                                <th>{agent.agentName}</th>
                                                <th>{agent.extension}</th>
                                                <td className="text-right" >{agent.daily_answered}</td>
                                                <td className="text-right" >{agent.daily_unanswered}</td>
                                                <td className="text-right" >{agent.daily_target}</td>
                                                <td className="text-right" >{agent.daily_percentage}%</td>
                                                <td className="text-right" >{agent.weekly_answered}</td>
                                                <td className="text-right" >{agent.weekly_unanswered}</td>
                                                <td className="text-right" >{agent.monthly_answered}</td>
                                                <td className="text-right" >{agent.monthly_unanswered}</td>
                                            </tr>
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th colSpan="2">Total</th>
                                            <th className="text-right" >{totals.daily_answered}</th>
                                            <th className="text-right" >{totals.daily_unanswered}</th>
                                            <th className="text-right" >{totals.daily_target}</th>
                                            <th className="text-right" >{totals.daily_target ? Math.round(totals.daily_answered / totals.daily_target * 10000) / 100 : 100}%</th>
                                            <th className="text-right" >{totals.weekly_answered}</th>
                                            <th className="text-right" >{totals.weekly_unanswered}</th>
                                            <th className="text-right" >{totals.monthly_answered}</th>
                                            <th className="text-right" >{totals.monthly_unanswered}</th>
                                        </tr>
                                    </tfoot>
                                </Table>
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
        getAgentCallStatisticsReport
    }, dispatch);
}

function mapStateToProps({ agent_call_counts }) {
    return {
        agent_call_counts,
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityReport);