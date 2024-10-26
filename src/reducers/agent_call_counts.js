import { AGENT_CALL_COUNTS_LOADED } from '../actions/config';
import _ from "lodash";

export default function (state = null, action) {
    switch (action.type) {
        case AGENT_CALL_COUNTS_LOADED:
            const result = [];

            for (let i = 0; i < action.payload.Monthly_data.length; i++) {
                const { extension, agentName } = action.payload.Monthly_data[i];
                const data = { extension, agentName };

                const m = _.find(action.payload.Monthly_data, { extension, agentName });
                const w = _.find(action.payload.weekly_data, { extension, agentName });
                const d = _.find(action.payload.daily_data, { extension, agentName });
                const a = _.find(action.payload.daily_archivements, { extension, agentName });

                data["monthly_answered"] = m ? m.outbound_call_count_answered : 0;
                data["monthly_unanswered"] = m ? m.outbound_call_count_unanswered : 0;
                data["weekly_answered"] = w ? w.outbound_call_count_answered : 0;
                data["weekly_unanswered"] = w ? w.outbound_call_count_unanswered : 0;
                data["daily_answered"] = d ? d.outbound_call_count_answered : 0;
                data["daily_unanswered"] = d ? d.outbound_call_count_unanswered : 0;
                data["daily_target"] = a ? a.calling_target : 0;
                data["daily_percentage"] = a ? a.percentage : 0;
                result.push(data);
            }

            return result;
        default:
            return state;
    }
}
