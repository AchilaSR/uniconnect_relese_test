import { USER_IMAGE_LOADED } from "../actions/config";

export default function (state = {}, action) {
  switch (action.type) {
    case USER_IMAGE_LOADED:
      const arr = {};
      arr[action.payload.extension] = action.payload.image + "?" + Math.random();
      return { ...state, ...arr };
    default:
      return state;
  }
}
