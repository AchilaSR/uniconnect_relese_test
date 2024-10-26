import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CRM_FORMS_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getDependencies = (module, next = () => { }) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getDynamicCRMForm',
            params: {
                uct: "1",
                module
            }
        }).then(function (response) {
            if (response.data) {
                const payload = _.find(response.data, { module });
                next(payload);
                if (payload) {
                    dispatch({ type: CRM_FORMS_LOADED, payload: payload.schema, module });
                }
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }

}

export const remove = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteDynamicCRMForm',
            params: {
                uct: "1",
                id
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(index());
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const create = (data, next) => {
    return (dispatch, getState) => {
        console.log("updateDynamicDispositionForm", data);
        axios({
            method: 'post',
            url: API_URL +  '/createDynamicCRMForm',
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
                toastr.error('Error', 'Failed to create the template');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}


export const send = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/createDynamicCRMForm',
            params: {
                uct: "1"
            },
            data: {
                ...data,
                "user_id": getState().user.login_id
            }
        }).then(function (response) {
            toastr.success('Success', "CRM note added");
            next();
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}