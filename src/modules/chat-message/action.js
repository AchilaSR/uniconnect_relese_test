import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CHAT_MESSAGE_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getChatMessages = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getEmailSmsChatMessages',
            params: {
                uct: "1"
            },
            data: {
                "filter": data
            }
        }).then(function (results) {
            dispatch({
                type: CHAT_MESSAGE_LOADED,
                payload: results.data
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);

        });
    }
}

