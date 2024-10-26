import { CALL_DETAILS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case CALL_DETAILS_LOADED:
            return action.payload;                   
        default:
            return state;
    }
}
