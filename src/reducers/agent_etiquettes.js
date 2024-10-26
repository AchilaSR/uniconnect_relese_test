import { AGENT_ETIQUETTE_REPORT_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_ETIQUETTE_REPORT_LOADED:
            return action.payload;
        default:
            return state;
    }
}
