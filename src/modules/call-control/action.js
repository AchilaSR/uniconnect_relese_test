import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_FORMS_LOADED } from './config';
import { updateCallAdditionalDetails } from '../disposition/action';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const transfer = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/transfer',
            params: {
                uct: "1",
                from : data.from,
                to : data.to
            }
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            toastr.success('Success', "Call Transfer Success");
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const bargein = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/bargein',
            params: {
                uct: "1",
                call_id : data.call_id,
                extension : data.extension,
                mode : data.mode
            }
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            toastr.success('Success', "You will get a call to your 3CX softphone.");
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}


