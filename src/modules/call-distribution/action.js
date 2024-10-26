import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CALL_DISTRIBUTION } from './config';
import moment from 'moment';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (data, next) => {
    return (dispatch, getState) => {
        const scale = { 'hour': "day", 'day': "month", 'month': "year" };
        const res = [];
        const interval = data.time_scale;

        data = {
            "startDate": moment(data.date).startOf(scale[data.time_scale]).format("yyyy-MM-DD HH:mm:ss"),
            "endDate": moment(data.date).endOf(scale[data.time_scale]).format("yyyy-MM-DD HH:mm:ss"),
            "queue": data.queues_in_monitor ? data.queues_in_monitor.join(" ") : null,
            "extension": data.groups_in_monitor ? data.groups_in_monitor.join(" ") : null,
            "dropInterval": data.filter,
            "timeScale": data.time_scale.substr(0, 1)
        }

        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getCallDistributionReport',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            for (var m = moment(data.startDate); m.diff(data.endDate, 's') < 0; m.add(1, interval)) {
                    const time_period = m.format("yyyy-MM-DD HH:mm:ss");
                    const r = _.find(response.data, { time_period });

                    if (r) {
                        res.push(r);
                    } else {
                        res.push({ time_period, ...r })
                    }
                }

            dispatch({
                type: CALL_DISTRIBUTION,
                payload: res
            });
        }).catch(function (error) {
            // dispatch({ type: CALL_DISTRIBUTION, payload: null });
            toastr.error('Error', error.message);
        }).finally(() => {
            if (typeof next === "function") {
                next(res);
            }
        });
    }

}


