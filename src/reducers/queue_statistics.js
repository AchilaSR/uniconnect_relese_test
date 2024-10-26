import moment from 'moment';
import _ from 'lodash';
import { QUEUE_STATS_LOADED } from '../actions/config';

export default function (state = null, action) {
    switch (action.type) {
        case QUEUE_STATS_LOADED:
            const result = [];
            const { hour_range, date_range } = action.payload.query;

            for (let hour = hour_range.start; hour <= hour_range.end; hour++) {
                const data = { hour, stats: [] };

                const startDate = new Date(date_range.start);
                const endDate = new Date(date_range.end);
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    const date = moment(currentDate).format("YYYY-MM-DD");
                    const time_period = moment(currentDate).set('hour', hour).format("YYYY-MM-DD HH:00:00");
                    const row = _.find(action.payload.data, { time_period });
                    const stat = {
                        date,
                        answered: 0,
                        unanswered: 0,
                        answered_sla: 0,
                    };

                    if (row) {
                        stat.answered = (row.inbound_answered || 0) + (row.outbound_answered || 0);
                        stat.unanswered = (row.inbound_total - row.inbound_answered || 0) + (row.outbound_total - row.outbound_answered || 0);
                        stat.answered_sla = (row.inbound_answered_within_sla || 0) + (row.outbound_answered || 0);
                    }

                    data.stats.push(stat);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                result.push(data);
            }

            return { query: action.payload.query, result };
        default:
            return state;
    }
}
