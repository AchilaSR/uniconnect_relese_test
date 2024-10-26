import { GROUPS_3CX_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case GROUPS_3CX_LOADED:
            return action.payload.filter(a => a.name.indexOf("___FAVORITES___") === -1);
        default:
            return state;
    }
}
