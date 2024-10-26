import { checkPermission } from '../../../config/util';
import { DISPOSITION_NOTES_LOADED } from '../config';
import _ from 'lodash';

export default function (state = [], action) {
    switch (action.type) {
        case DISPOSITION_NOTES_LOADED:
            let res = [];
            if (action.payload) {
                action.payload.forEach(element => {
                    element.id = element.id + "-" + element.agent_extension;
                });

                if (checkPermission('Disposition Management', 'READ')) {
                    res = action.payload;
                } else {
                    res = _.filter(action.payload, { agent_extension: action.extension });
                }

                if (action.append) {
                    return [...state, ...res].sort((a, b) => b.updated_time - a.updated_time);
                } else {
                    return res;
                }
            } else {
                return state;
            }
        default:
            return state;
    }
}
