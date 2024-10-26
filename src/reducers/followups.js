import { FOLLOWUPS_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case FOLLOWUPS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
