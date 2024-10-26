import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CALL_LOG_RECORD } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getCallLogRecord',
            params: {
                uct: "1",
                id: id
            }
        }).then(function (response) {
            dispatch({ type: CALL_LOG_RECORD, payload: response.data });
        }).catch(function (error) {
            dispatch({ type: CALL_LOG_RECORD, payload: null });
            // toastr.error('Error', error.message);
        });
    }

}

export const add = (data, next) => {
    
    return (dispatch, getState) => {
        data["added_by"]= getState().user.login_id;
        axios({
            method: 'post',
            url: API_URL + '/addCallLogRecord',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                next()
            } else {
                next("error");
                toastr.error('Error', 'Failed to add the call log');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}