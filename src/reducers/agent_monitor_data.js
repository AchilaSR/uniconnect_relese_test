import { AGENT_MONITOR_LOADED } from '../actions/config';
import { LINE_STATUS_UPDATED } from '../modules/line-status/config';

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_MONITOR_LOADED:
            return action.payload.map((e) => {
                const a = _.find(state, { agent_extension: e.agent_extension });
                if (a) {
                    e.line_status = a.line_status;
                }
                return e;
            });
        case LINE_STATUS_UPDATED:
            const s = state.map(e => {
                const a = _.find(action.payload, { extension: e.agent_extension });
                if (a) {
                    e.line_status = { status: a.status, number: a.customer_number, direction: a.direction, ...a };
                }else{
                    delete e.line_status;
                }

                return e;
            });
            return [...s];
        default:
            return state;
    }
}
