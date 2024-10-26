import { DISPOSITION_CLASSES_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_CLASSES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
