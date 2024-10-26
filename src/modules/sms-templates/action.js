import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { SMS_TEMPLATES_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getSMSTemplateList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: SMS_TEMPLATES_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (sms_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/deleteSMSTemplate',
            params: {
                uct: "1",
                sms_id
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
            url: API_URL + '/DialerCore/addSMSTemplate',
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

export const send = (data, next) => {
    
    return (dispatch, getState) => {
        data.from = getState().user.login_username +" - "+ getState().user.user_details.first_name 
        console.log(getState().user)
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/sendSMS',
            params: {
                uct: "1",
                agent:getState().user.login_username        
            },
            data
        }).then(function (response) {
            toastr.success('Success', "Message sent");
            // next()
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}