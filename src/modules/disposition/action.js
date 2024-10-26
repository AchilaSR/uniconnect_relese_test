import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL, REPORT_MAX_ROWS } from '../../config/globals';
import { DISPOSITION_CATEGORIES_LOADED, DISPOSITION_NOTES_LOADED, AGENT_PHONE_STATUS } from './config';
import moment from 'moment';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const listCategories = (queue, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/GetDispositionCategoryList',
            params: {
                uct: "1",
                extension: getState().user.user_details.extension,
                queue: queue
            }
        }).then(function (response) {
            if (next) {
                next(response.data);
            } else {
                dispatch({ type: DISPOSITION_CATEGORIES_LOADED, payload: response.data });
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}



export const index = (data, next) => {
    return (dispatch, getState) => {
        const user = getState().user;
        const loadLogs = (data, append) => {
            axios({
                method: 'post',
                url: API_URL + '/DIALER/GetDispositionData',
                params: {
                    access_token: user.access_token,
                },
                data
            }).then(function (response) {
                if (response.data) {
                    dispatch({ type: DISPOSITION_NOTES_LOADED, payload: response.data, extension: user.user_details.extension, append });
                }
                if (response.data && response.data.length >= REPORT_MAX_ROWS) {
                    data.endTime = moment(response.data[response.data.length - 1].updated_time).add(-1, 's').toDate();
                    loadLogs(data, true);
                    next(true);
                } else {
                    next(false);
                }
            }).catch(function (error) {
                toastr.error('Error', error.message);
                next(false);

            });
        }
        loadLogs(data);
    }

}

export const remove = (note_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/deleteDespositionNoteTemplate',
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
            url: API_URL + '/DIALER/addDespositionNoteTemplate',
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
        if (getState().phone_status.direction) {
            axios({
                method: 'post',
                url: API_URL + '/DIALER/updateDispositionData',
                params: {
                    uct: "1",
                },
                data: {
                    service: getState().user.user_details.outboundservice.service_name,
                    ...data,
                    user_id: getState().user.login_id,
                    direction: getState().phone_status.direction
                }
            }).then(function (response) {
                if (response.data) {
                    toastr.success('Success', response.data.message);
                }
                next()
            }).catch(function (error) {
                next(error);
                toastr.error('Error', error.message);
            });
        } else {
            next();
            toastr.error('Error', "Time exceeded!");
        }
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
            if (response.data) {
                toastr.success('Success', response.data.message);
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const updateCallAdditionalDetails = (data) => {
    return (dispatch, getState) => {
        if (getState().phone_status.status === "oncall") {
            localStorage.setItem("last_dispostion", JSON.stringify(data));
        } else {
            axios({
                method: 'post',
                url: API_URL + '/updateCallAdditionalDetails',
                params: {
                    uct: "1",
                },
                data: {
                    ...data
                }
            }).then(function (response) {
                // toastr.success('Success', response.data.message);
            }).catch(function (error) {
                // toastr.error('Error', error.message);
            });
        }
    }
}

export const updateCallAdditionalDetailsAfterCall = (number, data) => {
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
                axios({
                    method: 'post',
                    url: API_URL + '/updateCallAdditionalDetails',
                    params: {
                        uct: "1",
                    },
                    data: {
                        ...data,
                        call_id: parseInt(response.data.callId)
                    }
                }).then(function (response) {
                }).catch(function (error) {
                });
            }
        }).catch(function (error) {
        });
    }
}

