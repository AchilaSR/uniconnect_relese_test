import { CLI_LIST_LOADED } from "../config";

export default function (state = null, action) {
    switch (action.type) {
        case CLI_LIST_LOADED:
            return action.payload;
        default:
            return state;
    }
}
