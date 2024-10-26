import { CAMPAIGN_FILTERS_CHANGED } from '../actions/config';

export default function (state = {}, action) {
    switch (action.type) {
        case CAMPAIGN_FILTERS_CHANGED:
            return { ...state, ...action.payload };
        default:
            return state;
    }
}
