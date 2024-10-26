import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { BRANCH_CORDINATES_LOADED, LOCATIONS_LOADED, LOCATION_HISTORY_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getBranches = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getHNBGIBranchList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: BRANCH_CORDINATES_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}
export const sendLocation = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/sendLocation',
            params: {
                uct: "1",
            },
            data: { ...data, sending_user_id: getState().user.login_id }
        }).then(function (response) {
            next();
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}


export const tagLocation = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/tagLocation',
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            dispatch(getLocationHistory())
            next();
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}

export const getLocation = (msisdn, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/retriveCustomerLocation',
            params: {
                uct: "1",
                msisdn
            }
        }).then(function (response) {
            dispatch(getLocations());
            next(response.data);
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const getLocations = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getLocationList',
            params: {
                uct: "1"
            }
        }).then(function (response) {
            dispatch({ type: LOCATIONS_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteLocation = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/deleteLocation',
            params: {
                uct: "1",
                reference: id
            }
        }).then(function (response) {
            dispatch(getLocations());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const getLocationHistory = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getLocationHistoryList',
            params: {
                uct: "1"
            }
        }).then(function (response) {
            dispatch({ type: LOCATION_HISTORY_LOADED, payload: response.data });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}