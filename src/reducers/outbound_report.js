import { OUTBOUND_REPORT_LOADED } from '../actions/config';
import _ from "lodash";
import moment from "moment";
import { formatDateByUnit } from '../config/util';

export default function (state = null, action) {
    switch (action.type) {
        case OUTBOUND_REPORT_LOADED:
            const periods = [];
            const data = {};

            for (var m = moment(action.payload.filters.start_time); m.diff(action.payload.filters.end_time, 's') < 0; m.add(1, action.payload.filters.time_scale)) {
                const call_date = m.format('YYYY-MM-DD HH:mm:ss');
                const  date = formatDateByUnit(call_date, action.payload.filters.time_scale);
                periods.push(date);
                const agents = action.payload.filters.agent_extension;
                for (let i = 0; i < agents.length; i++) {
                    const extension = agents[i];
                    if (!data[extension]) {
                        const agent = _.find(action.payload.agents, { AgentExtension: extension });
                        data[extension] = { extension, agentName: agent.AgentName }
                    }
                    const record = _.find(action.payload.data, { extension: extension.toString(), call_date });
                    if (record) {
                        data[extension][date] = { "Answered": record.outbound_calls_answered, "Unanswered": record.outbound_calls - record.outbound_calls_answered }
                    } else {
                        data[extension][date] = { "Answered": 0, "Unanswered": 0 }
                    }
                }
            }

            return { periods, data };
        default:
            return state;
    }
}
