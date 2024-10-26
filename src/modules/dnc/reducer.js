import { DNC_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DNC_LOADED:
            return action.payload;
        default:
            return state;
    }
}
