import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { SERVICE_CONFIGS_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getOutboundIDList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: SERVICE_CONFIGS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (service_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteOutboundService',
            params: {
                uct: "1",
                service_id
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(index());
            } else {
                toastr.error('Error', 'Failed to delete the template');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const create = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/addOutboundService',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(index());
                next()
            } else {
                next("error");
                toastr.error('Error', 'Failed to create the template');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}

