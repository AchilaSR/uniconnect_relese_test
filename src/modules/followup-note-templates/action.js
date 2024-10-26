import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { FOLLOWUP_TEMPLATES_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getFollowUpNoteTemplateList',
            params: {
                uct: "1",
                queue: data
                // extension: getState().user.user_details.extension
            }
        }).then(function (response) {
            dispatch({ type: FOLLOWUP_TEMPLATES_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (note_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/deleteFollowUpNoteTemplate',
            params: {
                uct: "1",
                note_id
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
            url: API_URL + '/DialerCore/addFollowUpNoteTemplate',
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