import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_FORMS_LOADED } from './config';
import { updateCallAdditionalDetails } from '../disposition/action';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getDynamicDispositionForm',
            params: {
                uct: "1"
            }
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            dispatch({ type: DISPOSITION_FORMS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (template_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteDynamicDispositionForm',
            params: {
                uct: "1",
                template_id
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
            url: API_URL + (data.id ? '/updateDynamicDispositionForm' : '/addDynamicDispositionForm'),
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
    const number = data.number;
    delete data.number;
   
    return (dispatch, getState) => {
        data.extension = getState().user.login_username;
        axios({
            method: 'post',
            url: API_URL + '/saveDynamicDisposition',
            params: {
                uct: "1",
                number
            },
            data: {
                ...data,
                "user_id": getState().user.login_id
            }
        }).then(function (response) {
            console.log(getState().user.login_username)
            toastr.success('Success', "Disposition note added");
            next();
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}

export const tagDispositionWithCallID = (number, dis_data) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/tagDispositionWithCallID',
            params: {
                uct: "1",
                extension: getState().user.login_username,
                phone: number
            }
        }).then(function (response) {
            console.log(response.data)
            if (response.data && response.data.callId) {
                dispatch(updateCallLog({ call_log_id: parseInt(response.data.callId), disposition_data: JSON.stringify(dis_data) }));
                dispatch(updateCallAdditionalDetails({ call_id: parseInt(response.data.callId), agent: parseInt(getState().user.login_username), disposition: JSON.stringify(dis_data) }));
                // console.log(response.data)
            } else {
                toastr.error('Error', 'Failed to delete the template');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const updateCallLog = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/updateCallLog',
            params: {
                uct: "1",
            },
            data: {
                ...data
            }
        }).then(function (response) {
            toastr.success('Success', response.data.message);
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

// export const updateCallAdditionalDetails = (data) => {
//     return (dispatch, getState) => {
//         axios({
//             method: 'post',
//             url: API_URL + '/updateCallAdditionalDetails',
//             params: {
//                 uct: "1",
//             },
//             data: {
//                 ...data
//             }
//         }).then(function (response) {
//             toastr.success('Success', response.data.message);
//         }).catch(function (error) {
//             toastr.error('Error', error.message);
//         });
//     }
// }