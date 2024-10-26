import { LOCATIONS_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case LOCATIONS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
