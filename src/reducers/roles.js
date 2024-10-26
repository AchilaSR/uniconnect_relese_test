import { ROLES_LOADED, DELETE_ROLE } from '../actions/config';

export default function (state = [], action) {
    switch (action.type) {
        case ROLES_LOADED:
            return action.payload;
        case DELETE_ROLE:            
            return action.payload;                      
        default:
            return state;
    }
}
