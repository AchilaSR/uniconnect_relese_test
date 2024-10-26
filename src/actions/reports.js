import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL, LOCAL_PHONE_NUMBER_LENTGH, NOTIFICATION_REFRESH_INTERVAL, REPORT_MAX_ROWS } from '../config/globals';
import { REPORT_KPI_LOADED, ABANDONED_CALLS_LOADED, AGENT_CALL_COUNTS_LOADED, AGENT_HOLD_TIME_LOADED, CALL_LOGS_LOADED, AGENT_STATUS_CHANGE_REQUESTS_LOADED, QUEUE_STATS_LOADED, AGENT_ETIQUETTE_REPORT_LOADED, AGENT_ACTIVITY_LOGS_LOADED, AGENT_PERFORMANCE_LOADED, REPORTS_LOADED, AGENT_ACTIVITY_TMPL_LOADED, AGENT_ACTIVITY_REPORT_LOADED, AGENT_ACTIVITIES_LOADED, AGENTS_LOADED, AGENT_MONITOR_LOADED, CALL_DETAILS_LOADED, CALL_DATA_LOADED, DISPOSITION_REPORT_LOADED, CAMPAIGN_SUMMARY_LOADED, OUTBOUND_REPORT_LOADED, AGENT_LOGIN_HISTORY_LOADED, AGENT_CALL_SUMMARY_LOADED, AGENT_AFTER_CALL_TIME_LOADED, START_BG_PROCESS, STOP_BG_PROCESS } from './config';
import { currentDateTime } from '../utils/common';
import { formatMSecondsToTime, formatTimeToSeconds, formatDuration } from '../config/util';
import moment from 'moment';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const loadKPIReport = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getKPIData',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: REPORT_KPI_LOADED, payload: response.data.kpi_data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadQueueStatistics = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getCallDistributionReport',
            params: {
                uct: "1",
            },
            data: {
                "startDate": data.date_range.start,
                "endDate": data.date_range.end,
                "queue": data.queues.join(" ") || null,
                "extension": "",
                "dropInterval": data.filter,
                "timeScale": 'h'
            }
        }).then(function (response) {
            dispatch({ type: QUEUE_STATS_LOADED, payload: { data: response.data, query: data } });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        }).finally(() => {
            if (typeof next === "function") {
                next();
            }
        });
    }
}

export const getCallDetails = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getCallDetails',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: CALL_DETAILS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const getAbandonedCalls = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getCallSummaryByQueues',
            params: {
                uct: "1",
            },
            data: {
                queue: data.queue,
                start_time: data.date_range.start + " 00:00:00",
                end_time: data.date_range.end + " 23:59:59",
                time_scale: 'y'
            }
        }).then(function (response) {
            if (response.data) {
                dispatch({
                    type: ABANDONED_CALLS_LOADED, payload: response.data.map((a) => {
                        a.queue_name = _.find(getState().queues, { extension: a.queue }).display_name;
                        return a;
                    })
                });
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgentPerformance = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentPerformaceData',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: AGENT_PERFORMANCE_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const createReport = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/generateCampaignReportGL',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', "Report creation will process in background.");
                dispatch(loadReports());
                next();
            } else {
                toastr.error('Error', 'Failed to create the report');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadReports = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/GetReportList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: REPORTS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteReport = (id) => {
    console.log(id);
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/deleteReport',
            params: {
                uct: "1",
                report_id: id
            }
        }).then(function (response) {
            dispatch(loadReports());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgentActivityTemplates = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getTemplateList.htm',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_ACTIVITY_TMPL_LOADED, payload: response.data.TemplateData });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgents = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentsList.htm',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENTS_LOADED, payload: response.data.AgentData });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgentActivities = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentStatusList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_ACTIVITIES_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteAgentActivityTemplates = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/DeleteTemplate.htm',
            params: {
                uct: "1",
                template_id: id
            }
        }).then(function (response) {
            toastr.success('Success', "Template deleted");
            dispatch(loadAgentActivityTemplates());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgentActivityReport = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAgentData.htm',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            if (data.TemplateName) {
                dispatch(loadAgentActivityTemplates());
            }

            if (data.campaign) {
                dispatch({ type: AGENT_ACTIVITY_REPORT_LOADED, payload: response.data.ReportData.map((a) => ({ ...a, campaign: data.campaign })) });
            } else {
                dispatch({ type: AGENT_ACTIVITY_REPORT_LOADED, payload: response.data.ReportData });
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        }).finally(() => {
            next();
        });
    }
}

export const loadAgentActivityReportByTemplate = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAgentDataFromTemplate.htm',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: AGENT_ACTIVITY_REPORT_LOADED, payload: response.data.ReportData });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const loadAgentEtiquettesReport = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentEtiquetteList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_ETIQUETTE_REPORT_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const updateEtiquettesReport = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/updateEtiquetteList',
            params: {
                uct: "1",
            },
            data: {
                ...data,
                "rated_by": `${getState().user.user_details.first_name} ${getState().user.user_details.last_name} on ${currentDateTime()}`
            }
        }).then(function (response) {
            dispatch(loadAgentEtiquettesReport());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const getAgentMonitorData = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAgentMonitorData',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: AGENT_MONITOR_LOADED, payload: response.data });
            if (typeof next === "function") {
                next(null, response.data);
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            if (typeof next === "function") {
                next(error);
            }
        });
    }
}

export const getAgentMonitorDataByQueue = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAgentMonitorDataByQueue',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: AGENT_MONITOR_LOADED, payload: response.data });
            if (typeof next === "function") {
                next(null, response.data);
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            if (typeof next === "function") {
                next(error);
            }
        });
    }
}

export const getAgentStatusRequestsList = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentStatusRequestsList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_STATUS_CHANGE_REQUESTS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const approveStatusRequest = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/approveStatusRequest',
            params: {
                uct: "1",
                ...data
            },
        }).then(function (response) {
            // dispatch(getAgentMonitorData());
            toastr.success('success', response.data.message);
            dispatch(getAgentStatusRequestsList());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadAgentActivityLogReport = (data) => {
    return async (dispatch, getState) => {
        try {
            const response = await axios({
                method: 'post',
                url: API_URL + '/DialerCore/getAgentActivityReport',
                params: {
                    uct: "1",
                },
                data
            });
            dispatch({ type: AGENT_ACTIVITY_LOGS_LOADED, payload: response.data });
        } catch (error) {
            toastr.error('Error', error.message);
        }
    }
}

export const getLoginHistory = (data) => {
    return async (dispatch, getState) => {
        try {
            const agents = getState().agents;
            const response = await axios({
                method: 'post',
                url: API_URL + '/getUserLoginHistory',
                params: {
                    uct: "1",
                },
                data
            });

            if (response.data) {
                dispatch({
                    type: AGENT_LOGIN_HISTORY_LOADED, payload: response.data.map((a, i) => {
                        const agent = _.find(agents, { "AgentExtension": a.client_id.toString() });
                        return {
                            "id": i + 1,
                            "agent_extension": a.client_id,
                            "agent_name": agent ? agent.AgentName : "Ext. " + a.client_id,
                            "duration": a.duration ? formatDuration(a.duration) : "",
                            "login_time": a.login,
                            "last_active_time": a.logout
                        }
                    })
                });
            } else {
                dispatch({
                    type: AGENT_LOGIN_HISTORY_LOADED, payload: []
                })
            }
        } catch (error) {
            toastr.error('Error', error.message);
        }
    }
}

export const loadCallLogs = (data, next = () => { }) => {
    return (dispatch, getState) => {
        dispatch({ type: CALL_LOGS_LOADED, payload: [] });
        if (data.searchType === "phone") {
            const loadByPhone = async (phone, append) => {
                try {
                    const response = await axios({
                        method: 'post',
                        url: API_URL + '/DialerCore/getCallLogbyNumberInbound.htm',
                        params: {
                            uct: "1",
                        },
                        data: { number: phone.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH) }
                    });
                    dispatch({ type: CALL_LOGS_LOADED, payload: response.data, extension: getState().user.user_details.extension, append });

                    const response2 = await axios({
                        method: 'post',
                        url: API_URL + '/DialerCore/getCallLogbyNumberOutbound.htm',
                        params: {
                            uct: "1",
                        },
                        data: { number: phone.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH) }
                    });
                    dispatch({ type: CALL_LOGS_LOADED, payload: response2.data, extension: getState().user.user_details.extension, append: true });

                } catch (error) {
                    toastr.error('Error', error.message);
                } finally {
                    next();
                }
            }

            data.phone.forEach((phone, index) => {
                loadByPhone(phone.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH), index !== 0)
            });
        } else {
            const starttime = data.starttime;

            const loadLogs = (data, append) => {
                data.starttime = moment.max([moment(data.endtime).subtract(3, 'h'), moment(starttime)]).toDate();
                // console.log(`Fetching call logs from ${data.starttime} to ${data.endtime}`);
                axios({
                    method: 'post',
                    url: API_URL + '/DialerCore/getCallLog.htm',
                    params: {
                        uct: "1",
                    },
                    data
                }).then(function (response) {
                    dispatch({ type: CALL_LOGS_LOADED, payload: response.data, extension: getState().user.user_details.extension, append });
                    if (response.data.length >= REPORT_MAX_ROWS || data.starttime > starttime) {
                        data.endtime = data.starttime;
                        loadLogs(data, true);
                        next(true);
                    } else {
                        next(false);
                    }
                }).catch(function (error) {
                    toastr.error('Error', error.message);
                    next(false);
                }).finally(() => {
                });
            }
            loadLogs(data);
        }
    }
}

export const getAgentCallStatisticsReport = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentCallStatisticsReport',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_CALL_COUNTS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const getDispositionReport = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getDispositionReport',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: DISPOSITION_REPORT_LOADED, payload: response.data });
            } else {
                toastr.error('Error', 'Failed to create the report');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const getDialListSummary = (data, next) => {
    return (dispatch, getState) => {
        dispatch({ type: CAMPAIGN_SUMMARY_LOADED, payload: [] });

        axios({
            method: 'post',
            url: API_URL + '/DIALER/GetDialListSummary',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                const uniqueCampaignIds = new Set();

                const addUniqueValues = (data) => {
                    data.forEach(entry => {
                        uniqueCampaignIds.add(entry.campaign_id);
                    });
                };
                
                if (response.data.pg_data.length != 0 || response.data.mysql_data.length != 0) {

                    const pgData = response.data.pg_data;
                    const mysqlData = response.data.mysql_data;
                    const groupDateSample = pgData[0]?.group_date || mysqlData[0]?.group_date;

                    const interval = getIntervalType(groupDateSample);

                    addUniqueValues(pgData);
                    addUniqueValues(mysqlData);
                    const uniqueCampaignIdsArray = Array.from(uniqueCampaignIds);

                    let mergedData = processDataByInterval(interval, pgData, mysqlData, data.startDate, data.endDate, uniqueCampaignIdsArray);

                    dispatch({ type: CAMPAIGN_SUMMARY_LOADED, payload: mergedData });
                    next(response.data);
                } else {
                    dispatch({ type: CAMPAIGN_SUMMARY_LOADED, payload: [] });
                    next(response.data);
                }
            } else {
                toastr.error('Error', 'Failed to create the report');
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        }).finally(() => {
        });
    }
}


function getIntervalType(groupDate) {
    console.log(groupDate);
    if (groupDate === "-" || groupDate.length === 4) {
        return null;
    } else if (groupDate.length === 19) {
        return "hourly";
    } else if (groupDate.length === 10) {
        return "daily";
    } else if (groupDate.length === 7) {
        return "monthly";
    }
    return null;
}

function processDataByInterval(interval, pgData, mysqlData, startDate, endDate, uniqueCampaignIds) {
    let generatedData;

    if (interval) {
        generatedData = generateDataWithCampaigns(startDate, endDate, uniqueCampaignIds, interval);
    } else {

        generatedData = pgData.map(pg => {
            const matchingMySQL = mysqlData.find(mysql => mysql.campaign_id === pg.campaign_id);
            return {
                ...matchingMySQL,
                ...pg,
            };
        });

        // generatedData = mysqlData.map(pg => {
        //     const matchingMySQL = pgData.find(mysql => mysql.campaign_id === pg.campaign_id);
        //     if (matchingMySQL) {
        //         return {
        //             ...matchingMySQL,
        //             ...pg,
        //         };
        //     } else {
        //         return {
        //             ...pg,
        //             "unique_dialed_count": 0,
        //             "total_dialed_count": 0,
        //             "total_answered_count": 0,
        //             "total_unanswered_count": 0,
        //             "unique_answered_count": 0,
        //             "total_talk_time": 0,
        //             "total_wrap_time": 0
        //         };
        //     }

        // });

        return generatedData
    }
    return mergeData(generatedData, pgData, mysqlData, interval);
}

function generateDataWithCampaigns(startDate, endDate, campaignIds, interval) {
    let result = [];
    let start = new Date(startDate);
    let end = new Date(endDate);

    let incrementFunction, formatDateFunction;

    if (interval === 'hourly') {
        incrementFunction = (date) => date.setHours(date.getHours() + 1);
        formatDateFunction = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00:00`;
    } else if (interval === 'daily') {
        incrementFunction = (date) => date.setDate(date.getDate() + 1);
        formatDateFunction = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else if (interval === 'monthly') {
        incrementFunction = (date) => date.setMonth(date.getMonth() + 1);
        formatDateFunction = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    for (let current = new Date(start); current <= end; incrementFunction(current)) {
        let groupDate = formatDateFunction(current);
        for (let campaignId of campaignIds) {
            result.push({
                "service": "",
                "campaign_id": campaignId,
                "list": "",
                "list_count": 0,
                "upload_count": 0,
                "campaign_status": 0,
                "dnc_count": 0,
                "started_on": "",
                "ended_on": "",
                "group_date": groupDate,
                "unique_dialed_count": 0,
                "total_dialed_count": 0,
                "total_answered_count": 0,
                "total_unanswered_count": 0,
                "unique_answered_count": 0,
                "total_talk_time": 0,
                "total_wrap_time": 0
            });
        }
    }

    return result;
}

function mergeData(hourlyData, pgData, mysqlData) {
    let dataMap = {};

    pgData.forEach(item => {
        let key = `${item.campaign_id}_${item.group_date}`;
        dataMap[key] = {
            ...dataMap[key],
            ...item
        };
    });

    mysqlData.forEach(item => {
        let key = `${item.campaign_id}_${item.group_date}`;
        dataMap[key] = {
            ...dataMap[key],
            ...item
        };
    });

    hourlyData.forEach(item => {
        let key = `${item.campaign_id}_${item.group_date}`;

        if (dataMap[key]) {
            Object.assign(item, dataMap[key]);
        }
    });

    if (mysqlData.length > 0) {
        hourlyData.forEach(item => {
            const campaign = _.find(mysqlData, { campaign_id: item.campaign_id }) || {};
            item.service = campaign.service;
            item.list = campaign.list;
            item.list_count = campaign.list_count;
            item.dnc_count = campaign.dnc_count;
            item.started_on = campaign.started_on;
            item.ended_on = campaign.ended_on;
            item.campaign_status = campaign.campaign_status
        });
    }

    return hourlyData;
}

export const getOutboundReport = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getCallSummaryByAgents',
            params: {
                uct: "1",
            },
            data: {
                "agent_extension": data.agent_extension.join(" "),
                "start_time": data.duration.start_time,
                "end_time": data.duration.end_time,
                "time_scale": data.scale.substr(0, 1)
            }
        }).then(function (response) {
            dispatch({
                type: OUTBOUND_REPORT_LOADED,
                payload: {
                    data: response.data,
                    agents: getState().agents,
                    filters: {
                        "agent_extension": data.agent_extension,
                        "start_time": data.duration.start_time,
                        "end_time": data.duration.end_time,
                        "time_scale": data.scale
                    }
                }
            });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const getQueuePollingStatistics = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getQueuePollingStatistics',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            next(response.data);
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const getCallDataReport = (data, next) => {
    return (dispatch, getState) => {
        const startDate = data.startDate;
        dispatch({ type: START_BG_PROCESS });

        const loadLogs = (data, append) => {
            if (data.number === null && data.campaign_id === null) {
                data.startDate = moment.max([moment(data.endDate).subtract(1, 'weeks'), moment(startDate)]).format("YYYY-MM-DD HH:mm:ss");
            } else {
                data.startDate = moment.max([moment(data.endDate).subtract(3, 'months'), moment(startDate)]).format("YYYY-MM-DD HH:mm:ss");
            }

            if(data.endDate==null){
                data.startDate= null
            }

            axios({
                method: 'post',
                url: API_URL + '/getCallData',
                params: {
                    uct: "1",
                },
                data
            }).then(function (response) {
                dispatch({ type: CALL_DATA_LOADED, payload: response.data, append });
                if (data.startDate > startDate) {
                    data.endDate = data.startDate;
                    if (getState().background_process) {
                        loadLogs(data, true);
                        next(true);
                    } else {
                        next(false);
                    }
                } else {
                    next(false);
                    dispatch({ type: STOP_BG_PROCESS });
                }
            }).catch(function (error) {
                toastr.error('Error', error.message);
                dispatch({ type: STOP_BG_PROCESS });
                next(false);
            })
        }
        loadLogs(data);
    };
}

const aggregateActivitySummary = (data) => {
    data = data.reduce((acc, arr) => [...acc, ...(arr || [])], []);
    const groupedData = _.groupBy(data, (a) => (a.activity_date + '-' + a.agent));
    const sums = _.map(groupedData, group => {
        const metricsSum = group.reduce((acc, obj) => {
            Object.keys(obj).forEach(key => {
                if (key.startsWith("duration_")) {
                    acc[key] = formatMSecondsToTime(1000 * ((formatTimeToSeconds(acc[key]) || 0) + formatTimeToSeconds(obj[key])));
                } else if (key.startsWith("occurrence_")) {
                    acc[key] = (acc[key] || 0) + obj[key];
                } else {
                    acc[key] = obj[key]
                }
            });
            return acc;
        }, {});

        return {
            ...metricsSum
        };
    });

    return sums;
}

const aggregateCallSummary = (data) => {
    data = data.reduce((acc, arr) => [...acc, ...(arr || [])], []);
    const groupedData = _.groupBy(data, (a) => ((a.call_date || "") + '-' + a.extension));
    const sums = _.map(groupedData, group => {
        const metricsSum = group.reduce((acc, obj) => {
            Object.keys(obj).forEach(key => {
                if (["call_date", "extension"].indexOf(key) === -1) {
                    acc[key] = (acc[key] || 0) + obj[key];
                } else {
                    acc[key] = obj[key]
                }
            });
            return acc;
        }, {});

        return {
            ...metricsSum
        };
    });

    return sums;
}


const aggregateAfterCallTime = (data) => {
    data = data.reduce((acc, arr) => [...acc, ...(arr || [])], []);
    const groupedData = _.groupBy(data, (a) => ((a.updated_date || "") + '-' + a.extension));
    const sums = _.map(groupedData, group => {
        const metricsSum = group.reduce((acc, obj) => {
            Object.keys(obj).forEach(key => {
                if (["duration"].indexOf(key) > -1) {
                    acc[key] = (acc[key] || 0) + obj[key];
                } else {
                    acc[key] = obj[key]
                }
            });
            return acc;
        }, {});

        return {
            ...metricsSum
        };
    });

    return sums;
}

const aggregateHoldTime = (data) => {
    data = data.reduce((acc, arr) => [...acc, ...(arr || [])], []);
    const groupedData = _.groupBy(data, (a) => ((a.group_date || "") + '-' + a.extension));
    const sums = _.map(groupedData, group => {
        const metricsSum = group.reduce((acc, obj) => {
            Object.keys(obj).forEach(key => {
                if (["group_date", "updated_on", "extension"].indexOf(key) === -1) {
                    acc[key] = (acc[key] || 0) + obj[key];
                } else {
                    acc[key] = obj[key]
                }
            });
            return acc;
        }, {});

        return {
            ...metricsSum
        };
    });

    return sums;
}

export const getActivitySummaryByAgents = (filters, next) => {
    return (dispatch, getState) => {
        Promise.all(filters.map((data) => {
            return axios({
                method: 'post',
                url: API_URL + '/getActivitySummaryByAgents',
                params: {
                    uct: "1",
                },
                data
            })
        })).then(function (response) {
            const aggregatedData = aggregateActivitySummary(response.map(a => a.data));
            dispatch({ type: AGENT_ACTIVITY_REPORT_LOADED, payload: aggregatedData });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }
}

export const getCallSummaryByAgents = (filters, next) => {
    return (dispatch, getState) => {
        Promise.all(filters.map((data) => {
            return axios({
                method: 'post',
                url: API_URL + '/getCallSummaryByAgents',
                params: {
                    uct: "1",
                },
                data
            })
        })).then(function (response) {
            const aggregatedData = aggregateCallSummary(response.map(a => a.data));
            dispatch({ type: AGENT_CALL_SUMMARY_LOADED, payload: aggregatedData });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }
}

export const getAfterCallTime = (filters, next) => {

    return (dispatch, getState) => {
        Promise.all(filters.map((data) => {
            data.agent_extension = data.agent_extension.split(" ").join(",")
            return axios({
                method: 'post',
                url: API_URL + '/getAfterCallDuration',
                params: {
                    uct: "1",
                },
                data
            });
        })).then(function (response) {
            const aggregatedData = aggregateAfterCallTime(response.map(a => a.data));
            dispatch({ type: AGENT_AFTER_CALL_TIME_LOADED, payload: aggregatedData });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }
}

export const getHoldTime = (filters, next) => {
    return (dispatch, getState) => {
        Promise.all(filters.map((data) => {
            return axios({
                method: 'post',
                url: API_URL + '/getHoldTime',
                params: {
                    uct: "1",
                },
                data: {
                    extensions: data.agent_extension.split(" "),
                    start_time: data.start_time,
                    end_time: data.end_time,
                    time_scale: data.time_scale
                }
            });
        })).then(function (response) {
            const aggregatedData = aggregateHoldTime(response.map(a => a.data));
            dispatch({ type: AGENT_HOLD_TIME_LOADED, payload: aggregatedData });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }
}


export const stopBgProcess = () => {
    return (dispatch, getState) => {
        dispatch({ type: STOP_BG_PROCESS });
    }
}