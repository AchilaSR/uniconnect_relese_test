import { GROUPS_LOADED, GROUP_DELETED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case GROUPS_LOADED:
            return action.payload;
        case GROUP_DELETED:
            return action.payload;
        default:
            return state;
    }
}
