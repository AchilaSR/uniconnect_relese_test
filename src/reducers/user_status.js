import { USER_STATUS_CHANGED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case USER_STATUS_CHANGED:
            return action.payload;
        default:
            return state;
    }
}
