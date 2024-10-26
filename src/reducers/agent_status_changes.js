import { AGENT_STATUS_CHANGE_REQUESTS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_STATUS_CHANGE_REQUESTS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
