import { FIELD_LIST_LOADED } from '../config';

export default function (state = {}, action) {
    switch (action.type) {
        case FIELD_LIST_LOADED:
            state = { ...state, [action.module]: action.payload}
            return state;
        default:
            return state;
    }
}
