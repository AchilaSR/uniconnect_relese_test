import { AGENT_ACTIVITIES_LOADED } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case AGENT_ACTIVITIES_LOADED:
            return action.payload.map(a => {
                a.id = a.status_id;
                a.color_desc = a.color;
                a.sub_status_list = a.substatus;
                return a;
            });
        default:
            return state;
    }
}
