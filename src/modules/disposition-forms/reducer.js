import { DISPOSITION_FORMS_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case DISPOSITION_FORMS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
