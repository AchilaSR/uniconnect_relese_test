import { LEAD_STATUS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case LEAD_STATUS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
