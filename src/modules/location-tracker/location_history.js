import { LOCATION_HISTORY_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case LOCATION_HISTORY_LOADED:
            return action.payload;
        default:
            return state;
    }
}
