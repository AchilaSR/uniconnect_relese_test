import { toastr } from 'react-redux-toastr';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import rateLimit from 'axios-rate-limit';
import { API_URL, LOGIN_USERNAME_RANGE } from '../config/globals';
import store from '../index';
import history from '../history';

import { USER_LOGGED_IN, CRM_USER_LOGGED_IN, USER_LOGGED_OUT, USER_STATUS_CHANGED, AGENT_PHONE_STATUS, OUTBOUND_MODE_CHANGED, AUTO_DIALING_MODE_CHANGE } from './config';
import { searchRecords } from '../modules/crm/action';

const axios = rateLimit(setupCache(Axios, {
    // debug: console.log,
    interpretHeader: false,
    ttl: 500,
    methods: ['get', 'post']
}), { maxRPS: 5 });

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = "application/json";

axios.interceptors.request.use(
    config => {
        if (config.headers['Authorization']) {
            return config;
        } else {
            const token = localStorage.getItem("lbcc_user");
            if (token) {
                const at = JSON.parse(token);
                config.headers['Authorization'] = `Bearer ${at.access_token}`;
                return config;
            } else {
                return config;
            }
        }
    },
    error => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(function (response) {
    if (response.data && (response.data.status === "error" || response.data.status === "failed")) {
        if (response.data.description) {
            if (response.data.description) {
                toastr.error(response.data.message, response.data.description)
            } else {
                toastr.error(response.data.status, response.data.message)
            }
        }
        return { data: null };
    } else if (response.data && response.data.status === "warning") {
        toastr.warning(response.data.status.toUpperCase(), response.data.message);
        return { data: null };
    } else {
        return response;
    }
}, function (error) {
    console.log("AXIOS INTERCEPTOR", error);
    if (error.response && error.response.config && error.response.config.ignoreErrors) {
        return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
        store.dispatch({
            type: USER_LOGGED_OUT,
            payload: null
        });

        let message;

        if (error.response && error.response.data && error.response.data.error) {
            message = error.response.data.error;
        }

        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        }

        if (error.config && error.config.url.indexOf("/token") > -1) {
            return Promise.reject(new Error(message));

        }

        history.push("/")
        return Promise.resolve({});
    } else {
        return Promise.reject(error);
    }
});

export const getVersion = (next) => {
    axios.get(API_URL + "/").then((res) => {
        next(res.data);
    })
}

export const login = (auth) => {
    const username = auth.username;
    if (LOGIN_USERNAME_RANGE.test(username)) {
        return (dispatch, getState) => {
            axios({
                method: 'post',
                url: API_URL + '/token/3cx',
                // auth: auth,
                data: {
                    user: auth.username,
                    password: auth.password
                }
            }).then(function (response) {
                if (response.data) {
                    axios({
                        method: 'get',
                        url: API_URL + '/AccessManager/Login/new',
                        params: {
                            access_token: response.data.access_token,
                            user: auth.username
                        }
                    }).then(function (userData) {
                        dispatch({
                            type: USER_LOGGED_IN,
                            payload: { ...response.data, ...userData.data }
                        });

                        // dispatch(setStatus(3, 0, () => {
                        dispatch(setStatus(4, 0));
                        // }));

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
                    }).catch(function (error) {
                        console.log("Login Error", error);
                        toastr.error('Error', error.message);
                    });
                }
            }).catch(function (error) {
                console.log("Login Error 2", error);
                toastr.error('Error', "Invalid Credentials");
            });
        }
    } else {
        toastr.error('Error', "Invalid Username");
    }
}

export const logout = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/AccessManager/Logout',
            params: {
                uct: "1",
                user: getState().user.user_details.extension,
            }
        }).then(function (results) {
            dispatch({
                type: USER_LOGGED_OUT,
                payload: null
            });
            next();
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}

export const setStatus = (status, substatus, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/SetPresenceStatus',
            params: {
                uct: "1",
                extension: getState().user.user_details.extension,
                status,
                substatus
            }
        }).then(function (results) {
            dispatch(getStatus())
            if (typeof next === "function") {
                next();
            }
        }).catch(function (error) {
            toastr.error('Error', error.message);
        });
    }
}


export const getStatus = (next) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/DIALER/GetPresenceStatus',
            params: {
                uct: "1",
                extension: getState().user.user_details.extension,
            }
        }).then(function (results) {
            dispatch({
                type: USER_STATUS_CHANGED,
                payload: results.data
            });
        }).catch(function (error) {
            // toastr.error('Error', error.message);
        });
    }
}

export const getAgentPhoneStatus = () => {
    return (dispatch, getState) => {
        // if (checkPermission('Disposition Management', 'WRITE')) {
        axios({
            method: 'get',
            url: API_URL + '/DialerCore/getActiveCall',
            params: {
                uct: "1",
                agent_extension: getState().user.user_details.extension,
                outbound_mode: getState().user.outbound_mode || "0",
                uuid: Date.now()
            }
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: AGENT_PHONE_STATUS, payload: response.data });
            }
        });
        // } else {
        //     axios({
        //         method: 'get',
        //         url: API_URL + '/getLineStatus',
        //         params: {
        //             uct: "1",
        //             extension: getState().user.user_details.extension
        //         }
        //     }).then(function (response) {
        //         console.log("Line Status", response.data)
        //         dispatch({ type: AGENT_PHONE_STATUS, payload: response.data });
        //     })
        // }
    }
}


export const clearDataFromRedux = (actions = []) => {
    return (dispatch, getState) => {
        actions.forEach(element => {
            dispatch({ type: element, payload: undefined });
        });
    }
}

export const changeOutboundMode = (mode) => {
    return (dispatch, getState) => {
        console.log({ type: OUTBOUND_MODE_CHANGED, payload: mode });
        dispatch({ type: OUTBOUND_MODE_CHANGED, payload: mode });
    }
}

export const checkAutoDialMode = () => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/getAutoDailMode',
            params: {
                uct: "1",
                user: getState().user.login_username
            }
        }).then(function (res) {
            dispatch({
                type: AUTO_DIALING_MODE_CHANGE,
                payload: res.data.auto_dialing_mode
            });
        })
    }
}