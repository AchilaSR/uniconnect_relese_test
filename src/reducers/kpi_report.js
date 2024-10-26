import { REPORT_KPI_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case REPORT_KPI_LOADED:
            return action.payload;
        default:
            return state;
    }
}
