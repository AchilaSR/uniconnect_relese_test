import { QUEUE_CALLS_UPDATED } from '../modules/line-status/config';

export default function (state = null, action) {
    switch (action.type) {
        case QUEUE_CALLS_UPDATED:
            return action.payload;
        default:
            return state;
    }
}
