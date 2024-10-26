import { MODULE_LAYOUT_LOADED } from '../config';

export default function (state = {}, action) {
    switch (action.type) {
        case MODULE_LAYOUT_LOADED:
            state = { ...state, [action.module]: action.payload.fields}
            return state;
        default:
            return state;
    }
}
