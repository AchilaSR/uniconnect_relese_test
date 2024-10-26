import { DISPOSITION_PLANS_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_PLANS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
