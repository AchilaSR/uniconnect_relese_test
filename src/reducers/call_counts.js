import { CALL_COUNTS_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case CALL_COUNTS_LOADED:
            return action.payload;                   
        default:
            return state;
    }
}
