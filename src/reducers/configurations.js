import { EXTENTION_LOADED, EXTENTION_DELETED } from '../actions/config';
import { LOGIN_USERNAME_RANGE } from '../config/globals';

export default function (state = null, action) {
    switch (action.type) {
        case EXTENTION_LOADED:
            if (LOGIN_USERNAME_RANGE) {
                return action.payload.filter((a) => LOGIN_USERNAME_RANGE.test(a.extension))
            }
            return action.payload;
        case EXTENTION_DELETED:
            if (LOGIN_USERNAME_RANGE) {
                return action.payload.filter((a) => LOGIN_USERNAME_RANGE.test(a.extension))
            }
            return action.payload;
        default:
            return state;
    }
}
