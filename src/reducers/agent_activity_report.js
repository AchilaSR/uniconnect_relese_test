import { AGENT_ACTIVITY_REPORT_LOADED, AGENT_CALL_SUMMARY_LOADED, AGENT_AFTER_CALL_TIME_LOADED, AGENT_HOLD_TIME_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENT_ACTIVITY_REPORT_LOADED:
            return action.payload.filter((a) => a.agentname);
        case AGENT_CALL_SUMMARY_LOADED:
            return state.map(a => {
                // let call_summary = _.find(action.payload, { extension: a.agent, call_date: a.activity_date + " 00:00:00" }) || {};
                let call_summary = _.find(action.payload, (b) => {
                    return b.extension === a.agent && (_.startsWith(b.call_date, a.activity_date) || a.activity_date === "-")
                }) || {};

                call_summary = {
                    "total_calls": 0,
                    "inbound_calls": 0,
                    "outbound_calls": 0,
                    "inbound_calls_answered": 0,
                    "outbound_calls_answered": 0,
                    "inbound_calls_talk_time": 0,
                    "outbound_calls_talk_time": 0,
                    "inbound_calls_ring_time": 0,
                    "outbound_calls_ring_time": 0,
                    "inbound_calls_wrap_time": 0,
                    "outbound_calls_wrap_time": 0,
                    "inbound_calls_hold_time": 0,
                    "outbound_calls_hold_time": 0,
                    "outbound_calls_unanswered": 0,
                    "inbound_calls_unanswered": 0,
                    "inbound_answered_wrap_time": 0,
                    "inbound_unanswered_wrap_time": 0,
                    "outbound_answered_wrap_time": 0,
                    "outbound_unanswered_wrap_time": 0,
                    "inbound_calls_hold_count": 0,
                    "outbound_calls_hold_count": 0,
                    ...call_summary
                };
                a = { ...a, ...call_summary }
                return a
            });
        case AGENT_AFTER_CALL_TIME_LOADED:
            return state.map(a => {
                // let call_summary = _.find(action.payload, { extension: a.agent, GROUP_DATE: a.activity_date + " 00:00:00" }) || {};
                let call_summary = _.find(action.payload, (b) => {
                    return b.extension === a.agent && (_.startsWith(b.GROUP_DATE, a.activity_date) || a.activity_date === "-")
                }) || {};
                call_summary = { wrap_time: 0, adherence: 0, ...call_summary };
                a = { ...a, wrap_time: call_summary.duration }
                return a
            })
        case AGENT_HOLD_TIME_LOADED:
            return state.map(a => {
                // let hold_time = _.find(action.payload, { extension: a.agent, group_date: a.activity_date }) || {};
                let hold_time = _.find(action.payload, (b) => {
                    return b.extension === a.agent && (_.startsWith(b.group_date, a.activity_date) || a.activity_date === "-")
                }) || {};
                a = { ...a, hold_time: hold_time ? hold_time.hold_time : 0 }
                return a
            })
        default:
            return state;
    }
}
