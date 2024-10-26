import { BRANCHES_LOADED, PERIOD_DETAILS_LOADED, PRODUCT_DETAILS_LOADED, STATUS_DETAILS_LOADED, FOLLOWUP_METADATA_LOADED, KPIPARAMS_LOADED } from '../actions/config';

let init_state = { modules: [{ id: 1, name: "Leasing" }, { id: 2, name: "Gold Loans" }, { id: 3, name: "Personal Loans" }] };

export default function (state = init_state, action) {
    switch (action.type) {
        case BRANCHES_LOADED:
            return { ...state, ...{ branches: action.payload } };
        case PERIOD_DETAILS_LOADED:
            return { ...state, ...{ periods: action.payload } };
        case PRODUCT_DETAILS_LOADED:
            return { ...state, ...{ products: action.payload } };
        case STATUS_DETAILS_LOADED:
            return { ...state, ...{ status: action.payload } };
        case FOLLOWUP_METADATA_LOADED:
            return { ...state, ...{ notes_metadata: action.payload } };
        case KPIPARAMS_LOADED:
            return { ...state, ...{ kpi_params: action.payload } };
        default:
            return state;
    }
}
