import { IVRS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case IVRS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
