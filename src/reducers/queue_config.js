import { QUEUE_CONFIG_CHANGED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case QUEUE_CONFIG_CHANGED:
            return action.payload;
        default:
            return state;
    }
}
