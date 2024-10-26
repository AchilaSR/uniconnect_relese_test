import { DISPOSITION_TYPES_LOADED } from '../config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_TYPES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
