import { START_BG_PROCESS, STOP_BG_PROCESS } from '../actions/config';

export default function (state = false, action) {
    switch (action.type) {
        case START_BG_PROCESS:
            return true;
        case STOP_BG_PROCESS:
            return false;
        default:
            return state;
    }
}
