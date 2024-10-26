import { AGENTS_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENTS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
