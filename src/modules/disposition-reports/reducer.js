import { DISPOSITION_REPORT } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_REPORT:
            return action.payload;
        default:
            return state;
    }
}
