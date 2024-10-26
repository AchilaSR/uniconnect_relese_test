import { TEMPLATES_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case TEMPLATES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
