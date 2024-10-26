import { DELETED_CAMPAIGN_LIST } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DELETED_CAMPAIGN_LIST:
            return action.payload;
        default:
            return state;
    }
}
