import { DISPOSITIONS_LOADED } from '../config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITIONS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
