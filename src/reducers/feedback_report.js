import { FEEDBACKS_LOADED } from '../actions/config';

export default function (state = { data: [] }, action) {
    switch (action.type) {
        case FEEDBACKS_LOADED:
            return action.payload;
        default:
            return state;
    }
}
