import { REPORTS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case REPORTS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
