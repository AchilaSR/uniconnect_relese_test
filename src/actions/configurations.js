import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../config/globals';
import { EXTENTION_LOADED, QUEUES_LOADED, GROUPS_3CX_LOADED, KPIPARAMS_LOADED, IVRS_LOADED, AGENT_GROUPS_LOADED, AGENT_BREAK_CONFIG_LOADED } from './config';
import { loadAgentActivities } from './reports';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const listExtensions = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/extenstionsList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: EXTENTION_LOADED, payload: response.data.extensions });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const listKPIParameters = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getKPIParameters',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: KPIPARAMS_LOADED, payload: response.data.KPI_List });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteExtention = (props) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/deleteExtension',
            params: {
                uct: "1",
                id: props
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                //dispatch({ type: EXTENTION_DELETED, payload: response.data });
                dispatch(listExtensions());
            } else {
                toastr.error('Error', 'Failed to delete extention');
            }

        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const createExtention = (props) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/addExtension',
            params: {
                uct: "1",
                extension: props.extension
            }
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(listExtensions());
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const listQueues = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/queueList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: QUEUES_LOADED, payload: response.data });
            if (next) {
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}
export const listIVRs = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/ivrList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: IVRS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}
export const listAgentGroup = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/agentGroupList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_GROUPS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const listAgentBreakConfig = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getAgentBreakDurations',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: AGENT_BREAK_CONFIG_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const updateAgentStatus = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/addStatus',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            if (response.data) {
                dispatch(loadAgentActivities());
                next();
            } else {
                next(true);
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next(true);
        });
    }
}


export const list3cxGroups = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/get3CXGroupList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: GROUPS_3CX_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}