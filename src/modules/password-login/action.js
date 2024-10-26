import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import { API_URL } from '../../config/globals';
import { CRM_USER_LOGGED_IN, PASSWORD_CHANGED, USER_LOGGED_IN } from '../../actions/config';
import { setStatus } from '../../actions';
import _ from 'lodash';
import { searchRecords } from '../crm/action';
import { error } from 'logrocket';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

export const login = (data, next) => {
    return (dispatch) => {
        axios({
            method: 'post',
            url: API_URL + '/token/new',
            data
        }).then(function (response) {
            if (response.data) {
                axios({
                    method: 'get',
                    url: API_URL + '/AccessManager/Login/new',
                    params: {
                        access_token: response.data.access_token,
                        user: data.user
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
                    } else {
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
            console.log(error)
            toastr.error('Error', error.message);
            next();
        });
    }
}



export const changePassword = (password, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/AccessManager/Reset-Password',
            params: {
                uct: "1"
            },
            data: {
                "user": getState().user.login_username,
                "password": password
            },
        }).then(function (res) {
            toastr.success('Success', "Password changed successfully");
            dispatch({
                type: PASSWORD_CHANGED
            });
            next()
        }).catch((err) => {
            if(err.response && err.response.data && err.response.data.message){
                alert(err.response.data.message);
            }
            next(err)
        })
    }
}

export const checkCurrentPassword = (password, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/token/new',
            data: {
                user: getState().user.login_username,
                password
            },
            ignoreErrors: true
        }).then(function (response) {
            next(true);
        }).catch(() => {
            next(false);
        })
    }
}
