import axios from 'axios';
import { API_URL } from '../../config/globals';
import { LINE_STATUS_UPDATED, QUEUE_CALLS_UPDATED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";
let last_check = Date.now();

export const getLineStatus = (extension, next = () => { }) => {
    return (dispatch, getState) => {
        if (last_check > (Date.now() - 2000)) {
            const line_status = _.find(getState().line_status, { extension });
            if (line_status) {
                next(null, line_status);
            } else {
                next(null, { status: "idle" });
            }
            return;
        }

        last_check = Date.now();
        axios({
            method: 'get',
            url: API_URL + '/showallcalls',
            params: {
                uct: "1"
            }
        }).then(function (response) {
            if (response.data) {
                dispatch({
                    type: QUEUE_CALLS_UPDATED,
                    payload: {
                        queued: _.groupBy(_.uniqBy(response.data, (a) => `${a.extension}-${a.customer_number}`), 'extension'),
                        answered: _.groupBy(_.filter(response.data, { status: "oncall" }), 'queue')
                    }
                });

                dispatch({
                    type: LINE_STATUS_UPDATED,
                    payload: response.data
                });

                const status = _.find(response.data, { extension });
                if (status) {
                    next(null, status);
                    return;
                }
            }
            next(null, { status: "idle" });
        }).catch(function (error) {
            next(null, { status: "idle" });
        });

    }
}
