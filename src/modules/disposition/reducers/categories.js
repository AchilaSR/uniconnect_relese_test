import { DISPOSITION_CATEGORIES_LOADED } from '../config';

export default function (state = [], action) {
    switch (action.type) {
        case DISPOSITION_CATEGORIES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
