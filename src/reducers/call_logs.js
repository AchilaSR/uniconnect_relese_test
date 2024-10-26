import { CALL_LOGS_LOADED } from '../actions/config';
import call_types from '../config/call_types';
import call_permissions from '../config/call_permissions';
import _ from "lodash";

function findType(call) {
    const type = _.find(call_types, (a) => {
        let res = false;
        for (let i = 0; i < a.filter.length; i++) {
            const filter = a.filter[i];
            if (filter.destination === call.destination_type && filter.source === call.source_type) {
                res = true;
            } else if (typeof filter.destination === "undefined" && filter.source === call.source_type) {
                res = true;
            } else if (typeof filter.source === "undefined" && filter.destination === call.destination_type) {
                res = true;
            }
        }
        return res;
    })

    if (type) {
        return type.label;
    } else {
        return "Other";
    }
}

export default function (state = [], action) {
    switch (action.type) {
        case CALL_LOGS_LOADED:
            const res = [];
            if (!action.payload) {
                action.payload = [];
            }

            for (let i = 0; i < action.payload.length; i++) {
                const { destination_caller_id, source_caller_id } = action.payload[i];
                action.payload[i].id = i + "_" + action.payload[i].call_id;
                action.payload[i].type = findType(action.payload[i]);

                const hasAccess =
                    destination_caller_id === `Ext.${action.extension}` ||
                    source_caller_id === `Ext.${action.extension}` ||
                    _.find(call_permissions, (a) => {
                        return action.extension.match(a[0]) &&
                            (
                                destination_caller_id.match(a[1]) ||
                                source_caller_id.match(a[1])
                            )
                    })
                if (hasAccess) {
                    res.push(action.payload[i]);
                }

            }

            if (action.append) {
                return [...state, ...res].sort((a, b) => b.start_time - a.start_time);
            } else {
                return res;
            }
        default:
            return state;
    }
}
