import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_REPORT } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getReport = (data, next = () => { }) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getDispositionReportData',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: DISPOSITION_REPORT, payload: response.data });
                next(response.data);
            } else {
                next();
                toastr.error('Error', 'Failed to create the report');
            }
        }).catch(function (error) {
            next();
            toastr.error('Error', error.message);
        });
    }
}
