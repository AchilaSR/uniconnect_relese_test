import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../../../config/globals';
import { FIELD_LAYOUT_LOADED } from './config';

axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/getCustomFieldList.htm',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: FIELD_LAYOUT_LOADED, payload: response.data });
            if (next && typeof next === "function") {
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadCampaignField = (campaign_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/getCustomFieldListForTheCampaign',
            params: {
                uct: "1",
                campaign_id
            }
        }).then(function (response) {
            dispatch({ type: FIELD_LAYOUT_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const remove = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/deleteCustomField.htm',
            params: {
                uct: "1",
                id
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(index());
            } else {
                toastr.error('Error', 'Failed to delete the field');
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
            url: API_URL + '/DIALER/addModifyCustomField',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            toastr.success('Success', response.data.message);
            dispatch(index());
            next()
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
            url: API_URL + '/DIALER/DialerCore/sendEmail',
            params: {
                uct: "1",
                agent:getState().user.login_username
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                next()
            } else {
                next("error");
                toastr.error('Error', 'Failed to send email.');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}