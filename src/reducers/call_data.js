import { CALL_DATA_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case CALL_DATA_LOADED:
            const res = action.payload.sort((a, b) => (b.id - a.id)).map((a) => ({ ...a, uuid: `${a.id}-${a.agent}` }));
            if (action.append) {
                return [...state, ...res].sort((a, b) => b.start_time - a.start_time);
            } else {
                return res;
            }
        default:
            return state;
    }
}
