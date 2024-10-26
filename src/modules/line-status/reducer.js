import { LINE_STATUS_UPDATED } from "./config";

export default function (state = {}, action) {
    switch (action.type) {
        case LINE_STATUS_UPDATED:
            return action.payload;
        default:
            return state;
    }
}