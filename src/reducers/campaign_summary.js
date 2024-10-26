import { CAMPAIGN_SUMMARY_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case CAMPAIGN_SUMMARY_LOADED:
           return action.payload
        default:
            return state;
    }
}
