import { CHAT_MESSAGE_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case CHAT_MESSAGE_LOADED:
            return action.payload;
        default:
            return state;
    }
}
