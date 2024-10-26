import LogRocket from 'logrocket';
import { PASSWORD_CHANGED, USER_LOGGED_IN, CRM_USER_LOGGED_IN, USER_LOGGED_OUT, USER_CONFIG_LOADED, GROUP_CONFIG_LOADED, PROFILE_UPDATED, OUTBOUND_ID_CHANGED, RING_MY_MOBILE_CHANGED, OUTBOUND_MODE_CHANGED, AUTO_DIALING_MODE_CHANGE } from '../actions/config';

if (process.env.REACT_APP_LOGROCKET_CODE) {
    LogRocket.init(process.env.REACT_APP_LOGROCKET_CODE);
}

export default function (state = JSON.parse(localStorage.getItem('lbcc_user')), action) {
    switch (action.type) {
        case USER_LOGGED_IN:
            LogRocket.identify(action.payload.login_username, {
                name: action.payload.user_details.first_name + " " + action.payload.user_details.last_name,
            });
            localStorage.setItem('lbcc_user', JSON.stringify(action.payload));
            return action.payload;
        case USER_LOGGED_OUT:
            localStorage.removeItem('lbcc_user');
            return null;
        case AUTO_DIALING_MODE_CHANGE:
            const user_details_2 = state.user_details;
            const newState_2 = { ...state, ...{ user_details: { ...user_details_2, auto_dialing_mode: action.payload } } };
            localStorage.setItem('lbcc_user', JSON.stringify(newState_2));
            return newState_2;
        case CRM_USER_LOGGED_IN:
            const newState_3 = { ...state, crm_user: action.payload };
            localStorage.setItem('lbcc_user', JSON.stringify(newState_3));
            return newState_3;
        case PROFILE_UPDATED:
        case RING_MY_MOBILE_CHANGED:
            const user_details = state.user_details;
            const newState = { ...state, ...{ user_details: { ...user_details, ...action.payload } } };
            localStorage.setItem('lbcc_user', JSON.stringify(newState));
            return newState;
        case OUTBOUND_ID_CHANGED:
            const user_details_1 = state.user_details;
            const newState_1 = { ...state, ...{ user_details: { ...user_details_1, outboundservice: action.payload } } };
            localStorage.setItem('lbcc_user', JSON.stringify(newState_1));
            return newState_1;
        case USER_CONFIG_LOADED:
            state.user_config = action.payload
            return state;
        case GROUP_CONFIG_LOADED:
            state.group_config = action.payload
            return state;
        case OUTBOUND_MODE_CHANGED:
            return { ...state, outbound_mode: action.payload }
        case PASSWORD_CHANGED:
            const newState_4 = { ...state, last_password_update_time: new Date() }
            localStorage.setItem('lbcc_user', JSON.stringify(newState_4));
            return newState_4
        default:
            return state;
    }
}
