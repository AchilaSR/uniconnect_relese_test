import _ from 'lodash';
import { GET_ALL_RECORDS } from '../config';

export default function (state = {}, action) {
    switch (action.type) {
        case GET_ALL_RECORDS:
            if (action.payload) {
                if (action.page === 0) {
                    state = { ...state, [action.module]: action.payload }
                } else {
                    if (state[action.module]) {
                        state = { ...state, [action.module]: _.uniqBy([...state[action.module], ...action.payload], "id") }
                    } else {
                        state = { ...state, [action.module]: action.payload }
                    }
                }
            }
            return state;
        default:
            return state;
    }
}
