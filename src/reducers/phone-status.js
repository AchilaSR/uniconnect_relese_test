import { AGENT_PHONE_STATUS } from '../actions/config';
import _ from 'lodash';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_PHONE_STATUS:
            if (action.payload) {
                if (action.payload.status === "dialing")
                    action.payload.direction = "outbound";
                if (action.payload.status === "ringing")
                    action.payload.direction = "inbound";

                if (!action.payload.direction && action.payload.status !== "idle" && state)
                    action.payload.direction = state.direction;

                if (action.payload.status === "idle" || !action.payload.status)
                    delete action.payload.direction;

                action.payload.elapsed_time = action.payload.duration || 0;

                return action.payload;
            } else {
                return state;
            }
        default:
            return state;
    }
}
