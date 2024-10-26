import { GET_ALL_RECORDS_BY_PAGE } from '../config';

export default function (state = {}, action) {
    switch (action.type) {
        case GET_ALL_RECORDS_BY_PAGE:
            state = { ...state, [action.module]: action.payload }
            return state;
        default:
            return state;
    }
}
