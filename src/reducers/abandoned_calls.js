import { ABANDONED_CALLS_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case ABANDONED_CALLS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
