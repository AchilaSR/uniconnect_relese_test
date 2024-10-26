import { BRANCH_CORDINATES_LOADED } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case BRANCH_CORDINATES_LOADED:
            return action.payload;
        default:
            return state;
    }
}
