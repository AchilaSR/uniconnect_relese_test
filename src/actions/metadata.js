import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../config/globals';

import { BRANCHES_LOADED, PERIOD_DETAILS_LOADED, PRODUCT_DETAILS_LOADED, STATUS_DETAILS_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const loadBranches = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/LBFAPI/GetBranchAsync',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: BRANCHES_LOADED,
                payload: results.data.branchVM
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadPeriods = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/LBFAPI/GetPeriodDetailsAsync',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: PERIOD_DETAILS_LOADED,
                payload: results.data.periodVM
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadProducts = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/LBFAPI/GetProductDetailsAsync',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: PRODUCT_DETAILS_LOADED,
                payload: results.data.productVM
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadTicketStatus = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/LBFAPI/GetTicketStatusDetailsAsync',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: STATUS_DETAILS_LOADED,
                payload: results.data.ticketStatusVM
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}