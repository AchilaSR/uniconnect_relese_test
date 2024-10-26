import { OUTBOUND_IDS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case OUTBOUND_IDS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
