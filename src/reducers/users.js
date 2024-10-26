import { USERS_LOADED, USER_DELETED } from '../actions/config';
import { LOGIN_USERNAME_RANGE } from '../config/globals';

export default function (state = null, action) {
    switch (action.type) {
        case USERS_LOADED:
            if (LOGIN_USERNAME_RANGE) {
                return action.payload.filter((a) => LOGIN_USERNAME_RANGE.test(a.extension))
            }
            return action.payload;
        default:
            return state;
    }
}
