import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { SCHEDULE_REPORTS } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (i) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getScheduledReports',
            params: {
                uct: "1",
                id : getState().user.user_details.extension
            }
        }).then(function (response) {
            dispatch({ type: SCHEDULE_REPORTS, payload: response.data });
        }).catch(function (error) {
            dispatch({ type: SCHEDULE_REPORTS, payload: null });
            // toastr.error('Error', error.message);
        });
    }

}

export const remove = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteScheduledReports',
            params: {
                uct: "1",
                report_id: id
            }
        }).then(function (response) {
            dispatch(index());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const add = (data, next) => {

    return (dispatch, getState) => {
        data.createdBy = getState().user.user_details.extension
        console.log(getState().user.user_details.extension)
        axios({
            method: 'post',
            url: API_URL + '/addScheduledReports',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(index())
                next()
            } else {
                next("error");
                toastr.error('Error', 'Failed to add the schedule report');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}