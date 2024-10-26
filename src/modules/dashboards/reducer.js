import { DASHBOARD_TEMPLATES_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DASHBOARD_TEMPLATES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
