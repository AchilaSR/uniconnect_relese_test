import { AGENT_LOGIN_HISTORY_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENT_LOGIN_HISTORY_LOADED:
            return action.payload;
        default:
            return state;
    }
}
