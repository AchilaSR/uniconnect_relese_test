import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CRM_USER_LOGGED_IN, USER_LOGGED_IN } from '../../actions/config';
import { setStatus } from '../../actions';
import _ from 'lodash';
import { searchRecords } from '../crm/action';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const generateOtp = (extension, next) => {
    return () => {
        axios({
            method: 'get',
            url: API_URL + '/OTP/generate',
            params: {
                extension
            }
        }).then(function (response) {
            next(null);
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next(error);
        });
    }
}

export const validateOtp = (extension, OTP, next) => {
    return (dispatch) => {
        axios({
            method: 'get',
            url: API_URL + '/OTP/validate',
            params: {
                extension,
                OTP
            }
        }).then(function (response) {
            if (response.data) {
                axios({
                    method: 'get',
                    url: API_URL + '/AccessManager/OTP/Login',
                    params: {
                        access_token: response.data.access_token,
                        user: extension
                    }
                }).then(function (userData) {
                    dispatch({
                        type: USER_LOGGED_IN,
                        payload: { ...response.data, ...userData.data }
                    });

                    dispatch(setStatus(4, 0));

                    if (_.find(userData.data.login_rules, { readaccess: true, module_name: "Contacts Management" })) {
                        dispatch(searchRecords("Users", [{ field: "user_name", value: userData.data.login_username }], (err, data) => {
                            if (data && data.length > 0) {
                                dispatch({
                                    type: CRM_USER_LOGGED_IN,
                                    payload: data[0]
                                });
                            } else {
                                dispatch({
                                    type: CRM_USER_LOGGED_IN,
                                    payload: false
                                });
                            }
                        }, true));
                    }else{
                        dispatch({
                            type: CRM_USER_LOGGED_IN,
                            payload: false
                        });
                    }
                    next();
                }).catch(function (error) {
                    console.log("Login Error", error);
                    toastr.error('Error', error.message);
                    next();
                });
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
            next();
        });
    }
}
