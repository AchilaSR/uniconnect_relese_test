import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../config/globals';
import { CALL_COUNTS_LOADED } from './config';



axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getCallCounts = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getCallCountsDistribution',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch({ type: CALL_COUNTS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}
