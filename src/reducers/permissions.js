import { PERMISSION_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case PERMISSION_LOADED:
            return action.payload;
        default:
            return state;
    }
}
