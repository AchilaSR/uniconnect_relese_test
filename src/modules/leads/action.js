import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';

axios.defaults.headers.common['Content-Type'] = "application/json";

export const upload = (data, recon, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/DIALER/uploadLeads.htm',
            params: {
                uct: "1",
                reconcile_mode: recon
            },
            data
        }).then(function (response) {
            if (response.data) {
                // toastr.success('Success', response.data.message);
                next()
            } else {
                next("error");
                toastr.error('Error', 'Failed to upload leads!');
            }
        }).catch(function (error) {
            next(error);
            toastr.error('Error', 'Failed to upload leads!');
        });
    }
}
