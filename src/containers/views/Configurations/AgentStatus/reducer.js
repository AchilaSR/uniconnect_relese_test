import { FIELD_LAYOUT_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case FIELD_LAYOUT_LOADED:
            return action.payload;
        default:
            return state;
    }
}
