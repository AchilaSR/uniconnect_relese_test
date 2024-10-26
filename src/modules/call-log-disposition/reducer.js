import { DISPOSITION_DATA_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_DATA_LOADED:
            return action.payload;
        default:
            return state;
    }
}
