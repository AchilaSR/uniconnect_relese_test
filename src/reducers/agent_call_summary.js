import { AGENT_CALL_SUMMARY_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENT_CALL_SUMMARY_LOADED:
            return action.payload;
        default:
            return state;
    }
}
