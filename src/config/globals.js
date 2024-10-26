import moment from "moment";

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get('debug');

export const API_URL = process.env.REACT_APP_BASE_URL;
export const DISPOSITION_REPORT_TYPE = process.env.REACT_APP_DISPOSITION_REPORT_TYPE
export const FEEDBACK_API = process.env.REACT_APP_BASE_URL;
export const NOTIFICATION_REFRESH_INTERVAL = process.env.REACT_APP_NOTIFICATION_REFRESH_INTERVAL || 5;
export const DASHBOARD_REFRESH_INTERVAL = process.env.REACT_APP_DASHBOARD_REFRESH_INTERVAL || 5;
export const RECORDINGS_URL = process.env.REACT_APP_RECORDINGS_URL;
export const RECORDINGS_URL_BACKUP = process.env.REACT_APP_RECORDINGS_URL_BACKUP;
export const GOOGLE_MAP_KEY = process.env.REACT_APP_GOOGLE_MAP_KEY;
export const LOCATION_TRACKER_LINK = process.env.REACT_APP_LOCATION_TRACKER_LINK;
export const FEEDBACK_LINK = process.env.REACT_APP_FEEDBACK_LINK;
export const LOCAL_PHONE_REGEX = process.env.REACT_APP_LOCAL_PHONE_REGEX ? new RegExp(process.env.REACT_APP_LOCAL_PHONE_REGEX) : /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/;
export const INTL_PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
export const DASHBOARD_GRAPH_TYPE = "Outbound";
export const MI_API_URL = process.env.MI_API_URL;
export const LINK_3CX_CONFIG = process.env.REACT_APP_LINK_3CX_CONFIG;
export const LINK_3CX_REPORTS = process.env.REACT_APP_LINK_3CX_REPORTS;
export const HANDLING_TIME_SEC = process.env.REACT_APP_HANDLING_TIME_SEC || 5;
export const HANDLING_TIME_MAX = process.env.REACT_APP_HANDLING_TIME_MAX || 30;
export const PHONE_STATUS_REFRESH = process.env.REACT_APP_PHONE_STATUS_REFRESH || 3;
export const AGENT_STATUS_REFRESH = process.env.REACT_APP_AGENT_STATUS_REFRESH || 60;
export const AUTO_DIAL_INTERVAL = process.env.REACT_APP_AUTO_DIAL_INTERVAL || 15;
export const CAMPAIGN_REFRESH_INTERVAL = process.env.REACT_APP_CAMPAIGN_REFRESH_INTERVAL || 60;
export const AUTO_DIAL_ON_DISPOSITION = true;
export const MESSENGER_CLIENT = process.env.REACT_APP_MESSENGER_CLIENT;
export const MESSENGER_API_URL = process.env.REACT_APP_MESSENGER_API_URL;
export const LINK_CRM_CONFIG = process.env.REACT_APP_LINK_CRM_CONFIG;
export const LINK_CRM_REPORTS = process.env.REACT_APP_LINK_CRM_REPORTS;
export const DEFAULT_PAGE_SIZE = process.env.REACT_APP_DEFAULT_PAGE_SIZE || 10;
export const PASSWORD_EXPIRE_WARNING_DAYS = parseInt(process.env.REACT_APP_PASSWORD_EXPIRE_WARNING_DAYS) || 0;
export const LOGIN_USERNAME_RANGE = new RegExp(process.env.REACT_APP_LOGIN_USERNAME_RANGE) || /./;// /^[12]\d{3}$/;
export const CRM_FIELDS_PHONE = ["mobile", "phone", "otherphone", "homephone", "assistantphone", ...(process.env.REACT_APP_CRM_FIELDS_PHONE ? process.env.REACT_APP_CRM_FIELDS_PHONE.split(",").map(a => a.trim()) : [])];
export const CRM_FIELDS_ASSET = [...(process.env.REACT_APP_CRM_FIELDS_ASSET ? process.env.REACT_APP_CRM_FIELDS_ASSET.split(",").map(a => a.trim()) : [])];
export const DYNAMIC_DISPOSITION_FORMS = parseInt(process.env.REACT_APP_DYNAMIC_DISPOSITION_FORMS) === 1;
export const ENABLE_SCHEDULED_REPORTS = parseInt(process.env.REACT_APP_SCHEDULED_REPORTS) === 1;
export const LEGACY_ACTIVITY_SUMMARY_REPORT = parseInt(process.env.REACT_APP_LEGACY_ACTIVITY_SUMMARY_REPORT) === 1;
export const SHOW_ACTIVITY_SUMMARY_BY_CAMPAIGN = parseInt(process.env.REACT_APP_SHOW_ACTIVITY_SUMMARY_BY_CAMPAIGN) === 1;
export const CRM_DAYS_FIX_ASSIGNEE = process.env.REACT_APP_CRM_DAYS_FIX_ASSIGNEE || 0;
export const HOMEPAGE = process.env.REACT_APP_HOMEPAGE || "";
export const GET_LOGIN_TIME_FROM_3CX = parseInt(process.env.REACT_APP_GET_LOGIN_TIME_FROM_3CX) === 1;
export const DASHBOARD_SLA_BASED_ON_ANSWERED = parseInt(process.env.REACT_APP_DASHBOARD_SLA_BASED_ON_ANSWERED) === 1;
export const SHOW_WRAP_TIME = parseInt(process.env.REACT_APP_REPORT_SHOW_WRAP_TIME) === 1;
export const SHOW_HOLD_TIME = parseInt(process.env.REACT_APP_REPORT_SHOW_HOLD_TIME) === 1;
export const DEBUG_MODE = parseInt(process.env.REACT_APP_ENABLE_DEBUG_MODE) === 1 || debug;
export const SHOW_ADHERENCE = parseInt(process.env.REACT_APP_REPORT_SHOW_ADHERENCE) === 1 && SHOW_WRAP_TIME;
export const SUPPORT_IDD_NUMBERS = parseInt(process.env.REACT_APP_SUPPORT_IDD_NUMBERS) === 1;
export const HIDE_AGENT_STATUS_BAR = parseInt(process.env.REACT_APP_HIDE_AGENT_STATUS_BAR) === 1;
export const ENABLE_LEGACY_LOGIN = parseInt(process.env.REACT_APP_ENABLE_LEGACY_LOGIN) === 1;
export const CRM_HIDE_DEPENDENT_FIELDS_ON_VIEW = parseInt(process.env.REACT_APP_CRM_HIDE_DEPENDENT_FIELDS_ON_VIEW) === 1;
export const DASHBOARD_SHOW_3_RINGS = parseInt(process.env.REACT_APP_DASHBOARD_SHOW_3_RINGS) === 1;
export const LOCAL_PHONE_NUMBER_LENTGH = parseInt(process.env.REACT_APP_LOCAL_PHONE_NUMBER_LENTGH) || 9;
export const LOCAL_PHONE_NUMBER_PREFIX = process.env.REACT_APP_LOCAL_PHONE_NUMBER_PREFIX;
export const REPORT_MAX_ROWS = process.env.REACT_APP_REPORT_MAX_ROWS || 20000;
export const LOGIN_METHODS = process.env.REACT_APP_LOGIN_METHODS ? process.env.REACT_APP_LOGIN_METHODS.split(",").map(a => a.trim()) : ["3CX"]
export const LEAD_STATUS = process.env.REACT_APP_LEAD_STATUS ? process.env.REACT_APP_LEAD_STATUS.split(",").map(a => a.trim()) : null;
export const NOTIFICATION_CHANNELS = process.env.REACT_APP_NOTIFICATION_CHANNELS ? process.env.REACT_APP_NOTIFICATION_CHANNELS.split(",").map(a => a.trim()) : null;
export const CALL_LOGS_OLD = parseInt(process.env.REACT_APP_CALL_LOGS_OLD) === 1;
export const DISPOSITION_BUTTON = parseInt(process.env.REACT_APP_DISPOSITION_BUTTON) === 1;
export const CAMPAIGN_ALLOW_DUPLICATE_CONTENT = parseInt(process.env.REACT_APP_CAMPAIGN_ALLOW_DUPLICATE_CONTENT) === 1;
export const DISPOSITION_NOTE_DISPOSITION_DATA = parseInt(process.env.REACT_APP_DISPOSITION_NOTE_DISPOSITION_DATA) === 1;



export const LICENSE_EXPIRY_DATE = process.env.REACT_APP_LICENSE_EXPIRY_DATE || '2099-12-31';
export const LICENSE_EXPIRY_WARNING_DAYS = process.env.REACT_APP_LICENSE_EXPIRY_WARNING_DAYS || 14;
export const LICENSE_EXPIRY_WARNING_INTERVAL_MINS = process.env.REACT_APP_LICENSE_EXPIRY_WARNING_INTERVAL_MINS || 10;

export const DISPLAY_TRIAL_WARNING = moment(LICENSE_EXPIRY_DATE).diff(moment(), 'days') < LICENSE_EXPIRY_WARNING_DAYS; 
export const DISABLE_FEATURES = moment(LICENSE_EXPIRY_DATE).isBefore(moment()); 

export const FOLLOWUP_DISPOSITION = parseInt(process.env.REACT_APP_FOLLOWUP_DISPOSITION) === 1; 

export const DIALING_MODES = [{ value: 1, label: "Predictive" }, { value: 2, label: "Preview" }, { value: 3, label: "Power" }].filter((a) => {
    if (process.env.REACT_APP_DIALING_MODES) {
        if (process.env.REACT_APP_DIALING_MODES.indexOf(a.value) === -1) {
            return false;
        }
    }
    return true;
})

let call_log_date_range = ["1", "day"];
if (process.env.REACT_APP_CALL_LOGS_DATE_SEARCH_RANGE) {
    call_log_date_range = process.env.REACT_APP_CALL_LOGS_DATE_SEARCH_RANGE.split(/\s+/);
}
export const CALL_LOGS_DATE_RANGE = {
    value: parseInt(call_log_date_range[0].trim()),
    units: call_log_date_range[1].trim()
}

let call_log_backdate_range = ["1", "month"];
if (process.env.REACT_APP_CALL_LOGS_BACKDATE_RANGE) {
    call_log_backdate_range = process.env.REACT_APP_CALL_LOGS_BACKDATE_RANGE.split(/\s+/);
}
export const CALL_LOGS_BACKDATE_RANGE = {
    value: parseInt(call_log_backdate_range[0].trim()),
    units: call_log_backdate_range[1].trim()
}

export const PHONE_STATUS_COLORS = {
    idle: { color: "light", label: "Idle" },
    ringing: { color: "danger", label: "Ringing" },
    dialing: { color: "success", label: "Dialing" },
    oncall: { color: "warning", label: "On Call" },
    aftercall: { color: "info", label: "After Call" },
    loading: { color: "light", label: "Idle" }
}