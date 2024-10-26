import { SERVICE_CONFIGS_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case SERVICE_CONFIGS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
