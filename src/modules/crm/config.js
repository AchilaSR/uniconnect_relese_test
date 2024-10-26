export const MODULE_LAYOUT_LOADED = "MODULE_LAYOUT_LOADED";
export const FIELD_LIST_LOADED = "FIELD_LIST_LOADED";
export const GET_ALL_RECORDS = "GET_ALL_RECORDS";
export const GET_ALL_RECORDS_BY_PAGE = "GET_ALL_RECORDS_BY_PAGE";
export const RECORD_LOADED = "RECORD_LOADED";
export const GET_RECENT_ACTIVITY = "GET_RECENT_ACTIVITY";
export const SET_SORT_ORDER = "SET_SORT_ORDER";
export const GET_SORT_FIELDS = "GET_SORT_FIELDS ";


export const searchTypes = {
    PHONE_NUMBER: {
        label: "Phone",
        value: "phone"
    },
    CONTACT_ID: {
        label: "Contact ID",
        value: "contact_no"
    },
};

export const MODULES = {
    "HelpDesk": "Tickets",
    "Contacts": "Contacts",
    "ModComments": "Comments",
    "Products": "Products",
    "Assets": "Assets",
    "Accounts": "Business Partners",
    "Project": "Projects",
    "ProjectTask": "Project Tasks",
    "Leads": "Leads",
    "Potentials": "Opportunities",
}

export const MODULE_ICONS = {
    "HelpDesk": "fa-ticket",
    "Contacts": "fa-users",
    "ModComments": "fa-comments",
    "Products": "fa-cubes",
    "Assets": "fa-cube",
    "Accounts": "fa-briefcase",
    "Project": "fa-list",
    "ProjectTask": "fa-check-square-o",
    "Leads": "fa-user-o",
    "Potentials": "fa-lightbulb-o",
}

export const CRM_PERMISSIONS = {
    "HelpDesk": "Help Desk",
    "Potentials": "Opportunities Management",
    "Contacts": "Contacts Management",
    "Leads": "Leads Management",
    "ModComments": "Help Desk",
    "Products": "Assets",
    "Assets": "Assets",
    "Accounts": "Business Partners",
    "Project": "Project Management",
    "ProjectTask": "Project Management",
}

export const ACCESS_LEVELS = {
    VIEW: "readaccess",
    CREATE: "writeaccess",
    EDIT: "editaccess",
    DELETE: "deleteaccess",
}


export const TICKET_STATUS_COLORS = {
    "Open": "gray",
    "In Progress": "yellow",
    "Wait For Response": "LIGHT_RED",
    "Closed": "green"
}

export const CONTACT_RELATIONS = {
    HelpDesk: "contact_id",
    ModComments: "related_to",
    Project: "linktoaccountscontacts",
    Potentials: "contact_id",
    Assets: "contact",
}