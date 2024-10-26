import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../config/globals';
import { GROUPS_LOADED, GROUP_DELETED, GROUP_CONFIG_CHANGED } from './config';



axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const listGroups = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/groupList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: GROUPS_LOADED, payload: response.data.workgroups });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const deleteGroup = (props) => {
    return (dispatch, getState) => {
        console.log('propos---', props);
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/deleteGroup',
            params: {
                uct: "1",
                group_id: props
            }
        }).then(function (response) {
            if (response.data) {

                toastr.success('Success', response.data.message);
                dispatch({ type: GROUP_DELETED, payload: response.data });
                dispatch(listGroups());
            } else {
                toastr.error('Error', 'Failed to delete group');
            }

        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const createGroup = (props) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/AccessManager/AddGroup',
            params: {
                uct: "1"
            },
            data: {
                group_name: props.group_name,
                group_description: props.group_description
            }
        }).then(function (response) {
            if (response.data) {

                toastr.success('Success', response.data.message);
                dispatch(listGroups());
            } else {
                toastr.error('Error', 'Failed to create the group');
            }

        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const updateGroup = (props) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/AccessManager/ModifyGroup',
            params: {
                uct: "1"
            },
            data: {
                group_id: props.group_id,
                group_name: props.group_name,
                group_description: props.group_description
            }
        }).then(function (response) {
            if (response.data) {

                toastr.success('Success', response.data.message);
                dispatch(listGroups());
            } else {
                toastr.error('Error', 'Failed to update the group');
            }

        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}

export const saveConfig = (data) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/setAgentGroupConfigurations',
            params: {
                uct: "1"
            },
            data: data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.message);
                dispatch(loadConfig());
            } else {
                toastr.error('Error', 'Failed to update the configurations');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadConfig = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getGroupConfigList',
            params: {
                uct: "1"
            }
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: GROUP_CONFIG_CHANGED, payload: response.data });
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteConfig = (group_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/deleteAgentGroupConfigurations',
            params: {
                uct: "1",
                group_id
            }
        }).then(function (response) {
            if (response.data) {
                dispatch(loadConfig());
            } else {
                toastr.error('Error', 'Failed to delete the configurations');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}