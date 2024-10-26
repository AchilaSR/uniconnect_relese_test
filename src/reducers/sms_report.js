import { SMS_REPORT_LOADED } from '../modules/messenger/config';

export default function (state = null, action) {
    switch (action.type) {
        case SMS_REPORT_LOADED:
            return action.payload;
        default:
            return state;
    }
}
