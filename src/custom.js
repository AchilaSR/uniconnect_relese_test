export const CUSTOM = {
    PASSWORD_POLICY: {
        regex: "^(?!.*(.).*\\1.*\\1)(?=.*[A-Z].*[A-Z].*[A-Z])(?=.*[a-z].*[a-z].*[a-z])(?=.*\\d.*\\d)(?=.*[!@#$ %&*()+|\\-=\\{}\\[\\]:\";<>? /]).{12,32}$",
        rules: [
            "Minimum password length should be 12 characters",
            "Minimum 03 Upper-Case ALPHA Characters",
            "Minimum 03 Lower-Case ALPHA Characters",
            "Minimum 02 of Numeric Characters",
            "Minimum 02 Special Characters",
            "Minimum 02 Repeated Characters"
        ]
    },
    CRM_FILTERS: {
        "HelpDesk": ["ticketstatus IN ('Open','In Progress')", "assigned_user_id = '$userid'"]
    },
    CRM_MODULES: {
        "Contacts": "Contacts",
        "HelpDesk": "Tickets",
        "Leads": "Leads",
        "Potentials": "Opportunities",
        "Accounts": "Business Accounts",
        "Assets": "Assets",
        "Products": "Products",
        //"Project": "Tickets",
    },
    CRM_CONTACT_RELATIONS: [
        "HelpDesk",
        //"Project",
        "Potentials",
        "Assets",
        "ModComments"
    ],
    CRM_CONTACT_BUTTONS: [
        "HelpDesk",
        //"Project",
        "Potentials",
        "Assets",
        "ModComments",
        "Leads"
    ],
    CRM_DEPENDENT_FIELDS: {
        "Contacts": [
            {
                fields: ["cf_913", "cf_915", "cf_917"],
                dependency_file: "/locations.csv"
            }
        ],
        "HelpDesk": [
            {
                fields: [],
                dependency_file: "/CRM.csv"
            }
        ]
    },
    FIELD_ALIAS: {
        cf_2554: "salutationtype",
        cf_2836: "salutationtype",
        cf_2402: "lastname",
        cf_2618: "lastname",
        cf_2230: "cf_1532"
    }
}
