import axios from 'axios';
import { API_URL } from '../../config/globals';
import moment from 'moment';
import _ from "lodash";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getAgentStats = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getCallSummaryByAgents',
            params: {
                uct: "1",
            },
            data: {
                agent_extension: getState().user.user_details.extension,
                start_time: moment().startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                end_time: moment().endOf('day').format("YYYY-MM-DD HH:mm:ss"),
                time_scale: 'd'
            }
        }).then(function (response) {
            if (response.data && response.data.length) {
                next(null, response.data[0]);
            }
        }).catch(function (error) {
            // toastr.error('Error', error.message);
        });
    }
}

export const loadAgentBreak = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAgentData.htm',
            params: {
                uct: "1",
            },
            data: {
                "TemplateName": null,
                "Agents": [_.find(getState().agents, { AgentExtension: getState().user.user_details.extension.toString() }).AgentID],
                "Statuses": [5],
                "Duration": {
                    "startTime": moment().startOf('d').format("yyyy-MM-DD HH:mm:ss"),
                    "endTime": moment().endOf('d').format("yyyy-MM-DD HH:mm:ss")
                }
            }
        }).then(function (response) {
            next(null, response.data.ReportData);
        }).catch(function (error) {
            next(error)
        })
    }
}
