import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { MESSENGER_API_URL, MESSENGER_CLIENT } from '../../config/globals';
import { API_URL } from '../../config/globals';
axios.defaults.headers.common['Content-Type'] = "application/json";
axios.defaults.headers.common['Messenger-Client'] = MESSENGER_CLIENT;
axios.defaults.baseURL = API_URL;
import { SMS_REPORT_LOADED } from './config';

export const generateQR = () => {
    axios({
        method: 'get',
        url: MESSENGER_API_URL + '/whatsapp/qr'
    }).then(function () {
    }).catch(function (error) {
        toastr.error('Error', error.message);
    });
}

export const sendReply = (data, next) => {
    axios({
        method: 'post',
        url: MESSENGER_API_URL + '/reply',
        data: { ...data, account: MESSENGER_CLIENT }
    }).catch(function (error) {
        toastr.error('Error', error.message);
    }).finally(()=>{
        next();
    });
}

export const deleteSession = (id) => {
    axios({
        method: 'delete',
        url: MESSENGER_API_URL + '/whatsapp/id',
        data
    }).then(function () {
        toastr.error('Success', "Configuration Deleted Successfully");
    }).catch(function (error) {
        toastr.error('Error', error.message);
    });
}

export const SMSReport = (startdate, endDate,  to, from, limit, offset) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL+ '/DialerCore/getSMSReport',
            data: {
                startdate,
                endDate,
                to,
                from,
                limit,
                offset
            },
        })
            .then(function (response) {
                console.log(response.data);
                dispatch({ type: SMS_REPORT_LOADED, payload: response.data });
            })
            .catch(function (error) {
                console.error('Error fetching SMS report:', error);
            });
    };
};