import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DASHBOARD_TEMPLATES_LOADED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const index = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getDashboardDetailsTemplateList',
            params: {
                uct: "1",
                created_by: getState().user.user_details.extension
            }
        }).then(function (response) {
            dispatch({ type: DASHBOARD_TEMPLATES_LOADED, payload: response.data || [] });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}

export const remove = (dashboard) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/DeleteDashboardDetailsTemplate',
            params: {
                uct: "1",
                id:dashboard,
                created_by: getState().user.user_details.extension
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
        data.created_by = getState().user.user_details.extension
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/saveAllDashboardDetailsToTemplate',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data && response.data.inserted_id) {
                toastr.success('Success', response.data.message);
                // dispatch({ type: DASHBOARD_TEMPLATES_LOADED, payload: null });
                dispatch(index());
                next(data.id || (response.data.inserted_id.split("id : ")[1]).trim())
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

export const view = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getAllDashboardDetailsViaTemplateName',
            params: {
                uct: "1"
            },
            data: {
                "template_reference_name": data
            }
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
                toastr.error('Error', 'Failed to retrieve dashboard');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', error.message);
        });
    }
}


export const loadOutboundStats = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getDashboardDetailsOutbound',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
            }
        }).catch(function (error) {
            next(error);
        });
    }
}


export const loadIvrStats = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getIVRcallsDetails',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
                //toastr.error('Error', 'Failed to retrieve dashboard');
            }
        }).catch(function (error) {
            next(error);
            // toastr.error('Error', error.message);
        });
    }
}

export const loadInboundStats = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getDashboardDetailsInbound',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
                //toastr.error('Error', 'Failed to retrieve dashboard');
            }
        }).catch(function (error) {
            next(error);
            // toastr.error('Error', error.message);
        });
    }
}

export const loadTrend = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getCallSummaryByAgents',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
                // toastr.error('Error', 'Failed to retrieve dashboard');
            }
        }).catch(function (error) {
            next(error);
            // toastr.error('Error', error.message);
        });
    }
}

export const loadDistribution = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/getQueueStatisticsData',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
            }
        }).catch(function (error) {
            next(error);
            // toastr.error('Error', error.message);
        });
    }
}


export const loadLoginStats = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/getQueueLogin',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                next(null, response.data)
            } else {
                next("error");
            }
        }).catch(function (error) {
            next(error);
            // toastr.error('Error', error.message);
        });
    }
}