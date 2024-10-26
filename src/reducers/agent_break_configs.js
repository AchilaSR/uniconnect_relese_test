import { AGENT_BREAK_CONFIG_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_BREAK_CONFIG_LOADED:
            return action.payload;
        default:
            return state;
    }
}
