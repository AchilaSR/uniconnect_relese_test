import React, { Component } from 'react';
import { Card, CardHeader, CardBody, NavItem, NavLink, Table } from 'reactstrap';
import CreateReport from './create';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { CSVLink } from 'react-csv';
import { checkPermission, formatCurrency, formatDuration, formatTimeToSeconds, getReportData, removeMilliseconds } from '../../../../config/util';
import { loadAgentActivities } from '../../../../actions/reports';
import Loader from '../../../../components/Loader';
import { SHOW_ADHERENCE, SHOW_HOLD_TIME } from '../../../../config/globals';

class ActivityReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            campaign: null,
            showBreakCol: false
        }
    }

    componentWillMount() {
        this.setState({ showBreakCol: checkPermission('Break Approval', 'READ') });
    }

    componentDidMount() {
        this.props.loadAgentActivities();
    }

    renderRows(data) {
        const { agent_activity_report, agent_activities } = this.props;

        // console.log("prosps", this.props)

        let last_date = "";

        return data.map((a) => {
            let date;
            let rowSpan = 0;
            let totalTime = 0;
            let totalTime2 = 0;
            let adherence = "N/A";
            let staffTime = 0;
            //average talking time = (sum_talking_time)/answered calls
            let inbound_avg_tt = formatDuration(formatTimeToSeconds(a.inbound_calls_talk_time) / a.inbound_calls_answered);
            let outbound_avg_tt = formatDuration(formatTimeToSeconds(a.outbound_calls_talk_time) / a.outbound_calls_answered);
            let total_avg_tt = formatDuration((formatTimeToSeconds(a.inbound_calls_talk_time) + formatTimeToSeconds(a.outbound_calls_talk_time)) / (a.inbound_calls_answered + a.outbound_calls_answered));
            //average answered handling time = (taking + wrap) / answered
            let Answered_inbound_avg_ht = formatDuration((formatTimeToSeconds(a.inbound_calls_talk_time) + a.inbound_answered_wrap_time) / a.inbound_calls_answered);
            let Answered_outbound_avg_ht = formatDuration((formatTimeToSeconds(a.outbound_calls_talk_time) + a.outbound_answered_wrap_time) / a.outbound_calls_answered);
            let total_answered_avg_ht = formatDuration(((formatTimeToSeconds(a.inbound_calls_talk_time) + a.inbound_answered_wrap_time) + (formatTimeToSeconds(a.outbound_calls_talk_time) + a.outbound_answered_wrap_time)) / (a.inbound_calls_answered + a.outbound_calls_answered))
            //average unanswered handling time = (wrap) / unanswered
            let Unanswered_inbound_avg_ht = formatDuration(a.inbound_unanswered_wrap_time / a.inbound_calls_unanswered);
            let Unanswered_outbound_avg_ht = formatDuration(a.outbound_unanswered_wrap_time / a.outbound_calls_unanswered);
            let total_unanswered_avg_ht = formatDuration((a.inbound_unanswered_wrap_time + a.outbound_unanswered_wrap_time) / (a.inbound_calls_unanswered + a.outbound_calls_unanswered))

            let total_wrap_time = (a.inbound_answered_wrap_time || 0) + (a.inbound_unanswered_wrap_time || 0) + (a.outbound_answered_wrap_time || 0) + (a.outbound_unanswered_wrap_time || 0);
            let total_hold_count = (a.inbound_calls_hold_count || 0) + (a.outbound_calls_hold_count || 0)
            agent_activities.map((b) => {
                if ([1, 2, 4, 5].indexOf(b.status_id) > -1) {
                    staffTime += formatTimeToSeconds(a[`duration_${b.status_name}`]) || 0;
                }
            });


            // console.log(a)


            if (last_date !== a.activity_date) {
                date = a.activity_date;
                rowSpan = _.filter(agent_activity_report, { activity_date: date }).length;
                last_date = date;
            }
            return <tr>
                {this.state.interval && date ? <th style={{ verticalAlign: "top" }} rowSpan={rowSpan}>{date}</th> : ""}
                <th style={{ left: this.state.interval ? 128 : 0 }} className='fixed'>{a.agent}: {a.agentname}</th>
                {this.state.interval === 'd' ? <th>{a.login ? a.login.substr(11, 8) : ""}</th> : ""}
                {this.state.interval === 'd' ? <th>{a.logout ? a.logout.substr(11, 8) : ""}</th> : ""}
                <th>{formatDuration(staffTime)}</th>

                {agent_activities.map((b) => {
                    if (SHOW_ADHERENCE && [1, 2, 4].indexOf(b.status_id) > -1) {
                        totalTime += formatTimeToSeconds(a[`duration_${b.status_name}`]) || 0;
                    }

                    return <>
                        {b.sub_status_list ? b.sub_status_list.map((c) => <td className={`${formatTimeToSeconds(a[`duration_${b.status_name}_${c.sub_status_name}`]) > 0 ? `col-status light bg-${b.color_desc}` : ""}  text-center`}>{removeMilliseconds(a[`duration_${b.status_name}_${c.sub_status_name}`])}</td>) : ""}
                        <td className={`${formatTimeToSeconds(a[`duration_${b.status_name}`]) > 0 ? `col-status light bg-${b.color_desc}` : ""} font-weight-bold text-center`}>{removeMilliseconds(a[`duration_${b.status_name}`])}</td>

                        {this.state.showBreakCol && <>
                            {b.status_name == "Break" && <td className='text-center'>{a.duration_Break_Pending}</td>}
                            {b.status_name == "Break" && <td className='text-center'>{a.duration_Break_Rejected}</td>}
                        </>}


                    </>
                }
                )}
                {
                    SHOW_ADHERENCE ? <>
                        <td className={`text-right col-status light bg-orange`}>{formatDuration(totalTime)}</td>
                        <td className={`text-right col-status light bg-orange`}>{formatDuration(a.inbound_answered_wrap_time + a.inbound_unanswered_wrap_time + a.outbound_answered_wrap_time + a.outbound_unanswered_wrap_time)}</td>
                        <td className={`text-right font-weight-boldcol-status light bg-orange`}>{formatCurrency((formatTimeToSeconds(a.totalTime) - total_wrap_time) / formatTimeToSeconds(a.totalTime))}</td></> : ""
                }

                <td className='text-right font-weight-bold'>{a.inbound_calls}</td>
                <td className='text-right'>{a.inbound_calls_answered}</td>
                <td className='text-right'>{a.inbound_calls_unanswered}</td>
                {/* <td className='text-center'>{formatDuration(a.inbound_calls_ring_time)}</td> */}
                {/* inbound */}
                <td className='text-center'>{(a.inbound_calls_talk_time)}</td>
                <td className='text-center'>{(a.inbound_calls_ring_time)}</td>
                <td className='text-center'>{a.inbound_calls_hold_time}</td>
                <td className='text-center'>{inbound_avg_tt}</td>
                <td className='text-center'>{Answered_inbound_avg_ht}</td>
                <td className='text-center'>{Unanswered_inbound_avg_ht}</td>
                {/* <td className='text-center'>{(a.inboundcall_aht || 1)}</td> */}
                {/* outbound */}
                <td className='text-right font-weight-bold'>{a.outbound_calls}</td>
                <td className='text-right'>{a.outbound_calls_answered}</td>
                <td className='text-right'>{a.outbound_calls_unanswered}</td>
                {/* <td className='text-center'>{formatDuration(a.outbound_calls_ring_time)}</td> */}
                <td className='text-center'>{(a.outbound_calls_talk_time)}</td>
                <td className='text-center'>{(a.outbound_calls_ring_time)}</td>
                <td className='text-center'>{a.outbound_calls_hold_time}</td>
                <td className='text-center'>{outbound_avg_tt}</td>
                <td className='text-center'>{Answered_outbound_avg_ht}</td>
                <td className='text-center'>{Unanswered_outbound_avg_ht}</td>
                {/* <td className='text-center'>{(a.outboundcall_aht || 1)}</td> */}
                {/* Total */}
                <td className='text-right font-weight-bold'>{a.total_all_calls}</td>
                <td className='text-right'>{a.all_total_answered}</td>
                <td className='text-right'>{a.all_total_unanswered}</td>
                <td className='text-center'>{total_hold_count}</td>
                {/* {SHOW_HOLD_TIME ? <td className='text-right'>{formatDuration(a.outbound_calls_hold_time + a.inbound_calls_hold_time)}</td> : ""} */}
                <td className='text-center'>{(a.all_talk_time)}</td>
                <td className='text-center'>{a.all_hold_time}</td>
                <td className='text-center'>{total_avg_tt}</td>
                <td className='text-center'>{total_answered_avg_ht}</td>
                <td className='text-center'>{total_unanswered_avg_ht}</td>
                {/* <td className='text-center'>{((a.all_aht) || 1)}</td> */}
            </tr>
        })
    }

    render() {
        const { agent_activity_report, agent_activities } = this.props;

        if (!agent_activities) {
            return <Loader />
        }

        // !_.includes(key, 'ring_time') && key !== 'extension' 
        let { data, headers } = getReportData(this.props.agent_activity_report);

        if (headers) {
            const durationheaders = headers.filter(({ key }) => {
                return _.startsWith(key, 'duration');
            });
            const inboundheaders = headers.filter(({ key }) => {
                return _.startsWith(key, 'inbound_calls');
            });
            const outboundheaders = headers.filter(({ key }) => {
                return _.startsWith(key, 'outbound_calls');
            });
            headers = [
                this.state.interval ? { key: "activity_date", label: "Date" } : "",
                { key: "agent", label: "Extension" },
                { key: "agentname", label: "Agent Name" },
                this.state.interval === 'd' ? { key: "login", label: "Login Time" } : "",
                this.state.interval === 'd' ? { key: "logout", label: "Logout Time" } : "",
                { key: "staff_time", label: "Staff time" },
                ...durationheaders,
                SHOW_ADHERENCE ? { key: "totalTime", label: "Adherence Total Time" } : "",
                SHOW_ADHERENCE ? { key: "wrap_time", label: "Adherence Wrap Time" } : "",
                SHOW_ADHERENCE ? { key: "adherence_adh_index", label: " Adherence ADH Index" } : "",
                ...inboundheaders,
                { key: "inbound_avg_tt", label: "Inbound Average Talk Time" },
                { key: "ans_inboundcall_aht", label: "Inbound Calls AHT" },
                { key: "unasns_inboundcall_aht", label: "Inbound Calls Unans AHT" },
                ...outboundheaders,
                { key: "outbound_avg_tt", label: "Outbound Average Talk Time" },
                { key: "ans_outboundcall_aht", label: "Outbound Calls AHT" },
                { key: "unasns_outboundcall_aht", label: "Outbound Calls Unans AHT" },
                { key: "total_all_calls", label: "All Calls" },
                { key: "all_total_answered", label: "All Calls Total Answered Calls" },
                { key: "all_total_unanswered", label: "All Calls Total Unanswered Calls" },
                { key: "all_hold_count", label: "All Calls Hold count" },
                { key: "all_hold_time", label: "All Calls Hold Time" },
                { key: "all_talk_time", label: "All Calls Talk Time" },
                { key: "total_avg_tt", label: "Total Average Talk Time" },
                { key: "all_aht", label: "All Calls AHT" },
                { key: "all_aht_unans", label: "All Calls Unans AHT" },
            ].filter(a => a !== "");

            let keysToRemove = ["duration_Break_Approved", "duration_Break_Pending", "duration_Break_Rejected"];

            if (!this.state.showBreakCol) {
                // Remove objects with keys in keysToRemove array
                headers = headers.filter(item => !keysToRemove.includes(item.key));
            }


            if (data && data.length > 0) {
                data = data.map(item => {

                    const date = item.activity_date;
                    const agent = item.agent;
                    const agentname = item.agentname;
                    const login = item.login;
                    const logout = item.logout;
                    let staff_time = 0;

                    agent_activities.map((b) => {
                        if ([1, 2, 4, 5].indexOf(b.status_id) > -1) {
                            staff_time += formatTimeToSeconds(item[`duration_${b.status_name}`]) || 0;
                        }
                    });
                    const all_calls = item.inbound_calls + item.outbound_calls;
                    const total_answered = item.outbound_calls_answered + item.inbound_calls_answered;
                    const total_unanswered = item.outbound_calls + item.inbound_calls - item.inbound_calls_answered - item.outbound_calls_answered;
                    const hold_time = formatDuration(item.hold_time || 0);
                    const talk_time = formatDuration(parseInt(item.outbound_calls_talk_time) + parseInt(item.inbound_calls_talk_time));
                    const aht = formatDuration(((item.inbound_calls_talk_time + item.inbound_answered_wrap_time) + (item.outbound_calls_talk_time + item.outbound_answered_wrap_time)) / (item.inbound_calls_answered + item.outbound_calls_answered))
                    const all_aht_unans = formatDuration((item.inbound_unanswered_wrap_time + item.outbound_unanswered_wrap_time) / (item.inbound_calls_unanswered + item.outbound_calls_unanswered));
                    const outbound_aht = formatDuration(((item.outbound_calls_talk_time) + item.outbound_answered_wrap_time) / item.outbound_calls_answered);
                    const inbound_aht = formatDuration(((item.inbound_calls_talk_time) + item.inbound_answered_wrap_time) / item.inbound_calls_answered);
                    const unans_inbound_aht = formatDuration(item.inbound_unanswered_wrap_time / item.inbound_calls_unanswered);
                    const unans_outbound_aht = formatDuration(item.outbound_unanswered_wrap_time / item.outbound_calls_unanswered);
                    const outbound_calls_talk_time = formatDuration(item.outbound_calls_talk_time);
                    const outbound_calls_ring_time = formatDuration(item.outbound_calls_ring_time);
                    const inbound_calls_talk_time = formatDuration(item.inbound_calls_talk_time);
                    const inbound_calls_ring_time = formatDuration(item.inbound_calls_ring_time);
                    const outbound_calls_unanswered = item.outbound_calls_unanswered || 0;
                    const inbound_calls_unanswered = item.inbound_calls_unanswered || 0;
                    const inbound_calls_wrap_time = item.inbound_answered_wrap_time + item.inbound_unanswered_wrap_time;
                    const inbound_calls_hold_time = formatDuration(item.inbound_calls_hold_time);
                    const inbound_calls_hold_count = item.inbound_calls_hold_count;

                    //average talking time = (sum_talking_time)/answered calls
                    const inbound_avg_tt = formatDuration(item.inbound_calls_talk_time / item.inbound_calls_answered);
                    const outbound_avg_tt = formatDuration(item.outbound_calls_talk_time / item.outbound_calls_answered);
                    const total_avg_tt = formatDuration((item.inbound_calls_talk_time + item.outbound_calls_talk_time) / (item.inbound_calls_answered + item.outbound_calls_answered));

                    const all_hold_time = formatDuration(item.inbound_calls_hold_time + item.outbound_calls_hold_time)
                    const all_hold_count = item.inbound_calls_hold_count && item.outbound_calls_hold_count ?  item.inbound_calls_hold_count + item.outbound_calls_hold_count : 0

                    const outbound_calls_wrap_time = item.outbound_answered_wrap_time + item.outbound_unanswered_wrap_time;
                    const outbound_calls_hold_time = formatDuration(item.outbound_calls_hold_time);
                    const outbound_calls_hold_count = item.outbound_calls_hold_count;
                    let total_wrap_time = item.inbound_answered_wrap_time + item.inbound_unanswered_wrap_time + item.outbound_answered_wrap_time + item.outbound_unanswered_wrap_time;
                    const adherence_wrap_time = total_wrap_time;
                    //const totalTime = item.totalTime;
                    let totalTime = 0;

                    agent_activities.map((b) => {
                        if (SHOW_ADHERENCE && [1, 2, 4].indexOf(b.status_id) > -1) {
                            totalTime += formatTimeToSeconds(item[`duration_${b.status_name}`]) || 0;

                        }
                    });
                    item.totalTime = formatDuration(totalTime);

                    const adh_index = total_wrap_time != "NaN" ? formatCurrency((totalTime - total_wrap_time) / totalTime) : "00:00:00";
                    //  console.log(all_calls); 

                    item.inbound_calls_answered = item.inbound_calls_answered || 0;
                    item.total_all_calls = Math.round(all_calls);
                    item.all_total_answered = Math.round(total_answered);
                    item.all_total_unanswered = Math.round(total_unanswered);
                    item.all_hold_time = all_hold_time;
                    item.all_talk_time = talk_time;
                    item.all_aht = aht;
                    item.all_aht_unans = all_aht_unans;
                    item.ans_outboundcall_aht = outbound_aht;
                    item.ans_inboundcall_aht = inbound_aht;
                    item.unasns_inboundcall_aht = unans_inbound_aht;
                    item.unasns_outboundcall_aht = unans_outbound_aht;
                    item.activity_date = date;
                    item.agent = agent;
                    item.agentname = agentname;
                    item.login = login;
                    item.logout = logout;
                    item.staff_time = formatDuration(staff_time);
                    item.outbound_calls_talk_time = outbound_calls_talk_time;
                    item.outbound_calls_ring_time = outbound_calls_ring_time;
                    item.inbound_calls_talk_time = inbound_calls_talk_time;
                    item.inbound_calls_ring_time = inbound_calls_ring_time;
                    item.outbound_calls_unanswered = outbound_calls_unanswered;
                    item.inbound_calls_unanswered = inbound_calls_unanswered;
                    item.wrap_time = formatDuration(adherence_wrap_time);
                    item.adherence_adh_index = adh_index;
                    item.inbound_calls_wrap_time = formatDuration(inbound_calls_wrap_time);
                    item.inbound_calls_hold_time = inbound_calls_hold_time;
                    item.inbound_calls_hold_count = inbound_calls_hold_count;

                    item.outbound_calls_wrap_time = formatDuration(outbound_calls_wrap_time);
                    item.outbound_calls_hold_time = outbound_calls_hold_time;
                    item.outbound_calls_hold_count = outbound_calls_hold_count;
                    item.all_hold_count = all_hold_count;

                    item.inbound_avg_tt = inbound_avg_tt;
                    item.outbound_avg_tt = outbound_avg_tt;
                    item.total_avg_tt = total_avg_tt;

                    return item;
                });

            } else {
                console.log(data);
            }

            if (this.state.campaign) {
                headers = [{ key: "campaign", label: "Campaign" }, { key: "queue", label: "Queue" }, ...headers];
                data = data.map((a) => (
                    {
                        ...a,
                        campaign: this.state.campaign.campaign_name,
                        queue: this.state.campaign.outbound_queue,

                    }))
            }
        }



        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Activity Summary</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {data ? <CSVLink data={data} headers={headers} filename={"agent-activity-report.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div>
                            <CreateReport onCreated={(interval, campaign) => this.setState({ interval: interval, campaign: campaign })} />
                        </div>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>

                                {agent_activity_report && agent_activity_report.length ? <div className="sticky-table">
                                    <Table style={{ backgroundColor: "#ffffff" }} className='activity-summary' size='sm' bordered>
                                        <thead>
                                            <tr>
                                                {this.state.interval ? <th style={{ minWidth: 128, maxWidth: 128 }} rowSpan={2}>Date</th> : ""}
                                                <th className='fixed' style={{ width: 200, left: this.state.interval ? 128 : 0 }} rowSpan={2}>Agent</th>
                                                {this.state.interval === 'd' ? <th style={{ minWidth: 70, maxWidth: 70 }} rowSpan={2}>Login </th> : ""}
                                                {this.state.interval === 'd' ? <th style={{ minWidth: 70, maxWidth: 70 }} rowSpan={2}>Logout</th> : ""}
                                                <th style={{ minWidth: 70, maxWidth: 70 }} rowSpan={2}>Staff time</th>
                                                {agent_activities.map((a) =>
                                                    // <th className={`bg-${a.color_desc}`} colSpan={a.sub_status_list ? a.sub_status_list.length + 1 : 1} rowSpan={a.sub_status_list ? 1 : 2} style={{ width: a.sub_status_list ? undefined : 70 }}>
                                                    //     {a.status_name}
                                                    // </th>

                                                    <th className={`bg-${a.color_desc}`} colSpan={a.sub_status_list ? a.status_name == "Break" && this.state.showBreakCol ? a.sub_status_list.length + 3 : a.sub_status_list.length + 1 : 1} rowSpan={a.sub_status_list ? 1 : 2} style={{ width: a.sub_status_list ? undefined : 70 }}>
                                                        {a.status_name}
                                                    </th>
                                                )}
                                                {SHOW_ADHERENCE ? <th colSpan={3}>Adherence</th> : ""}
                                                <th colSpan={9}>Inbound</th>
                                                <th colSpan={9}>Outbound</th>
                                                <th colSpan={SHOW_HOLD_TIME ? 11 : 10}>All Calls</th>
                                            </tr>
                                            <tr>
                                                {agent_activities.map((a) =>
                                                    a.sub_status_list ? <>
                                                        {a.sub_status_list.map((b) =>
                                                            <th className={`sub bg-${a.color_desc} notfixed`} style={{ minWidth: 70, maxWidth: 70 }}>
                                                                {b.sub_status_name}
                                                            </th>)}
                                                        <th className={`sub bg-${a.color_desc} notfixed`} style={{ minWidth: 70, maxWidth: 70 }}>Total</th>

                                                        {this.state.showBreakCol && <>
                                                            {a.status_name == "Break" && <th className={`sub bg-${a.color_desc} notfixed`} style={{ minWidth: 70, maxWidth: 70 }}>Pending Approval</th>}
                                                            {a.status_name == "Break" && <th className={`sub bg-${a.color_desc} notfixed`} style={{ minWidth: 70, maxWidth: 70 }}>Rejected Approval</th>}
                                                        </>}

                                                    </> : ""
                                                )}
                                                {
                                                    SHOW_ADHERENCE ? <>
                                                        <th style={{ minWidth: 70, maxWidth: 70 }}>Total Time</th>
                                                        <th style={{ minWidth: 70, maxWidth: 70 }}>Wrap Time</th>
                                                        <th style={{ minWidth: 70, maxWidth: 70 }}>Adh. Index</th>
                                                    </> : ""
                                                }
                                                {
                                                    ["Inbound", "Outbound", "All Calls"].map((a) =>
                                                        <>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Calls</th>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Answered</th>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Unans.</th>
                                                            {a === "All Calls" && SHOW_HOLD_TIME ? <th style={{ minWidth: 70, maxWidth: 70 }}>Hold Count</th> : ""}
                                                            {/* {a === "All Calls" && SHOW_HOLD_TIME ? <th style={{ minWidth: 70, maxWidth: 70 }}>Hold Time</th> : ""} */}
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Talk Time</th>
                                                            {a === "Inbound" || a === "Outbound" ? <th style={{ minWidth: 70, maxWidth: 70 }}>Ring Time</th> : ""}
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Hold Time</th>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Average Talk Time</th>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>AHT</th>
                                                            <th style={{ minWidth: 70, maxWidth: 70 }}>Unans. AHT</th>
                                                            {/* <th style={{ minWidth: 70, maxWidth: 70 }}>AHT</th> */}
                                                        </>
                                                    )
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.renderRows(data)
                                            }
                                        </tbody>
                                    </Table>
                                </div> : "No data available"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ agent_activity_report, agent_activities }) {
    return {
        agent_activity_report, agent_activities
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgentActivities
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityReport);