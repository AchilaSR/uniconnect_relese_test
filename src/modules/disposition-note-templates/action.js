import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_TEMPLATES_LOADED } from './config';
import { updateCallAdditionalDetails } from '../disposition/action';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = (data) => {
    return (dispatch, getState) => {
        let params = {
            uct: "1",
        };

        if (data != null) {
            params.queue = data;
        } else {
            params.extension = getState().user.user_details.extension;
        }

        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getDespositionTemplateList',
            params: params,
        }).then(function (response) {
            dispatch({ type: DISPOSITION_TEMPLATES_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (note_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/deleteDespositionNoteTemplate',
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
            url: API_URL + '/DialerCore/addDespositionNoteTemplate',
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
        let service_name = "";
        try {
            service_name = getState().user.user_details.outboundservice.service_name;
        } catch (error) {

        }
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/setDespositionForRecoveryCall',
            params: {
                uct: "1"
            },
            data: {
                ...data,
                "user_id": getState().user.login_id,
                service_name
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                next()
            } else {
                next("error");
                toastr.error('Error', 'Disposition Note Added');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}

export const tagDispositionWithCallID = (number, dis) => {
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
            if (response.data) {
                dispatch(updateCallLog({ call_log_id: parseInt(response.data.callId), Comments: dis }));
                dispatch(updateCallAdditionalDetails({ call_id: parseInt(response.data.callId), agent: parseInt(getState().user.login_username), disposition: dis }));
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
//             // next(error);
//             toastr.error('Error', error.message);
//         });
//     }
// }

function removeDigits(number) {
    // Convert number to string
    let numberStr = number.toString();

    // Check if number of digits exceeds 9
    if (numberStr.length > 9) {
        // Remove the first digits to make the total number of digits 9
        numberStr = numberStr.slice(numberStr.length - 9);
    }

    return numberStr;
}