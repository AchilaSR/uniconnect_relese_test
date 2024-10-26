import {FACILITY_DETAILS_LOADED, CUSTOMER_LOADED } from '../actions/config';
import _ from 'lodash';

export default function (state = null, action) {
    switch (action.type) {
        case CUSTOMER_LOADED:
            return action.payload;
        case FACILITY_DETAILS_LOADED:
            Object.assign(_.find(state.facilityDetails, { ticketId: action.ticketId }), action.payload);
            return state;
        default:
            return state;
    }
}
