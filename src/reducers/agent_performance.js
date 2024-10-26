import { AGENT_PERFORMANCE_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_PERFORMANCE_LOADED:
            return action.payload;
        default:
            return state;
    }
}
