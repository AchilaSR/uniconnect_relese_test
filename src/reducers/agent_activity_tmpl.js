import { AGENT_ACTIVITY_TMPL_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENT_ACTIVITY_TMPL_LOADED:
            return action.payload;
        default:
            return state;
    }
}
