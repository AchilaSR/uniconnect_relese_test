import { AGENT_ACTIVITY_LOGS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_ACTIVITY_LOGS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
