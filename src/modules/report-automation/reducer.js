import { SCHEDULE_REPORTS } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case SCHEDULE_REPORTS:
            return action.payload;
        default:
            return state;
    }
}
