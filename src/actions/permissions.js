import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../config/globals';
import { PERMISSION_LOADED } from './config';


axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const loadPermissions = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/ModuleList',
            params: {
                uct: "1",
            }
        }).then(function (response) {
            dispatch({ type: PERMISSION_LOADED, payload: response.data.modules });
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }

}