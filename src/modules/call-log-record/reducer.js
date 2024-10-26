import { CALL_LOG_RECORD } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case CALL_LOG_RECORD:
            return action.payload;
        default:
            return state;
    }
}
