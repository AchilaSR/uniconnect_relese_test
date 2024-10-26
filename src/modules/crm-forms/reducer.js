import { CRM_FORMS_LOADED } from './config';

export default function (state = {}, action) {
    switch (action.type) {
        case CRM_FORMS_LOADED:
            return { ...state, [action.module]: action.payload };
        default:
            return state;
    }
}
