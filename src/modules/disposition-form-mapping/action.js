import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_PLANS_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getDynamicDispositionPlansMapping',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: DISPOSITION_PLANS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (mapping_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteDynamicDispositionPlanMapping',
            params: {
                uct: "1",
                mapping_id
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
            url: API_URL + '/InsertDynamicDispositionPlanMapping',
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

