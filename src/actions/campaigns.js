import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL, MI_API_URL } from '../config/globals';

import { LEAD_STATUS_LOADED, CAMPAIGNS_LOADED, TEMPLATES_LOADED, CAMPAIGNS_RESYNCED, CAMPAIGN_FILTERS_CHANGED } from './config';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const loadLeadStatuses = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/GetLeadsStatCodesList',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: LEAD_STATUS_LOADED,
                payload: results.data.LeadStatusCodesList
            });
            if (next) {
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadCampaigns = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/GetCampaignList',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: CAMPAIGNS_LOADED,
                payload: results.data.Campaigns
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const loadCampaignHistory = (campaign_id, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getCampaignHistory',
            params: {
                uct: "1",
                campaign_id
            }
        }).then(function (results) {
            next(null, results.data);
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next(error)
        });
    }
}

export const createCampaigns = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DIALER/createCSVDialerCampaign',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', "Campaign created successfully");
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const rescheduleCampaign = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/RescheduleCampaign',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', "Campaign created successfully");
                next();
                dispatch(loadCampaigns());
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const updateCampaigns = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DIALER/updateCSVDialerCampaign',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', "Campaign update successfully");
                next();
            } else {
                toastr.error('Error', 'Failed to update the campaign');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const changeStatus = (campaign_id, status) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/StartStopCampaign',
            params: {
                status: status,
                campaign_id: campaign_id,
                uct: "1"
            }
        }).then(function (results) {
            dispatch(loadCampaigns());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteCampaign = (campaign_id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DeleteCampaign',
            params: {
                campaign_id: campaign_id,
                uct: "1"
            }
        }).then(function (results) {
            dispatch(loadCampaigns());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const changeFilter = (filters) => {
    return (dispatch, getState) => {
        dispatch({
            type: CAMPAIGN_FILTERS_CHANGED,
            payload: filters
        });
    }
}

export const loadTemplates = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/GetCampaignTempateList.htm',
            params: {
                uct: "1"
            }
        }).then(function (results) {
            dispatch({
                type: TEMPLATES_LOADED,
                payload: results.data
            });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const loadTemplate = (name, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/GetCampaignConfigurationFromTemplate',
            params: {
                uct: "1"
            },
            data: {
                "Template_Name": name
            }
        }).then(function (results) {
            next(results.data);
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteTemplate = (name) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DialerCore/DeleteCampaignTempate',
            params: {
                uct: "1"
            },
            data: {
                "Template_Name": name
            }
        }).then(function (results) {
            dispatch(loadTemplates());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const reSyncCampaign = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: MI_API_URL + '/ResyncRecoveryData',
            params: {
                uct: "1"
            },
            data
        }).then(function (response) {
            if (response.data) {
                toastr.success('Success', response.data.contracts_count + " Facilities Fetched");
                dispatch({
                    type: CAMPAIGNS_RESYNCED,
                    payload: response.data
                });
                next();
            } else {
                toastr.error('Error', 'Failed to resync the campaign');
                next("Error")
            }
            dispatch(loadCampaigns());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}