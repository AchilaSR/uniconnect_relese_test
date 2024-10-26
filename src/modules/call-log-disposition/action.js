import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { DISPOSITION_DATA_LOADED } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const getDispositionByID = (id) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getDispositionByID',
            params: {
                uct: "1",
                id: id
            }
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: DISPOSITION_DATA_LOADED, payload: response.data });
            } else {
                toastr.error('Error', 'Failed to delete the template');
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });

    }
}