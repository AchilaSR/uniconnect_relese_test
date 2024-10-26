import { OUTBOUND_CLI_LOADED } from "../config";

export default function (state = null, action) {
    switch (action.type) {
        case OUTBOUND_CLI_LOADED:
            return action.payload;
        default:
            return state;
    }
}