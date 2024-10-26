import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DELETED_CAMPAIGN_LIST } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getCampaignList = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/GetDeletedCampaignsList',
            params: {
                uct: "1"
            }
        }).then(function (response) {
            dispatch({ type: DELETED_CAMPAIGN_LIST, payload: response.data });
        }).catch(function (error) {
            dispatch({ type: DELETED_CAMPAIGN_LIST, payload: null });
            // toastr.error('Error', error.message);
        });
    }

}

export const restore = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/RestoreCampaign',
            params: {
                uct: "1",
                "campaign_id": id
            }
        }).then(function (results) {
            dispatch(getCampaignList());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const deleteCampaign = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DeleteArchiveCampaign',
            params: {
                uct: "1",
                "campaign_id": id
            }
        }).then(function (results) {
            dispatch(getCampaignList());
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}