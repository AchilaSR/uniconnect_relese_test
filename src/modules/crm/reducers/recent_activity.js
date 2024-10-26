import { GET_RECENT_ACTIVITY } from '../config';

export default function (state = {}, action) {
    switch (action.type) {
        case GET_RECENT_ACTIVITY:
            return {
                ...state,
                [action.module]: action.payload
            };
        default:
            return state;
    }
}

