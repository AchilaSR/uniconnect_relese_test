import { FEEDBACK_HOTLINE_LOADED, FEEDBACK_LANGUAGES_LOADED, FEEDBACK_LIST_LOADED, FEEDBACK_TRANSFER_EXT_LOADED } from '../actions/config';

let init_state = {};

export default function (state = init_state, action) {
    switch (action.type) {
        case FEEDBACK_HOTLINE_LOADED:
            return { ...state, ...{ hotlines: action.payload } };
        case FEEDBACK_LANGUAGES_LOADED:
            return { ...state, ...{ languages: action.payload } };
        case FEEDBACK_LIST_LOADED:
            return { ...state, ...{ feedbacks: action.payload } };
        case FEEDBACK_TRANSFER_EXT_LOADED:
            return { ...state, ...{ extentions: action.payload } };
        default:
            return state;
    }
}
