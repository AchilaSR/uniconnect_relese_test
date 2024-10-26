import { combineReducers } from "redux";
import { reducer as form } from 'redux-form';
import { reducer as toastr } from 'react-redux-toastr';

import user from "./auth";
import metadata from "./metadata";
import users from "./users";
import groups from "./groups";
import facility from "./facility";
import facilities from "./facilities";
import leadstatus from "./leadstatus";
import campaigns from "./campaigns";
import campaign_filters from "./campaign_filters";
import roles from "./roles";
import permissions from "./permissions";
import configurations from "./configurations";
import followups from "./followups";
import agent_configs from "./agent_configs";
import group_configs from "./group_configs";
import queue_configs from "./queue_config";
import templates from "./templates";
import kpi_report from "./kpi_report";
import call_counts from "./call_counts";
import agent_performance from "./agent_performance";
import reports from "./reports";
import images from "./images";
import agent_activity_tmpl from "./agent_activity_tmpl";
import agents from "./agents";
import agent_activities from "./agent_activities";
import agent_activity_report from "./agent_activity_report";
import queue_statistics from "./queue_statistics";
import agent_etiquettes from "./agent_etiquettes";
import feedback_meta from "./feedback_meta";
import feedback_report from "./feedback_report";
import agent_monitor_data from "./agent_monitor_data";
import agent_activity_logs from "./agent_activity_logs";
import agent_status_changes from "./agent_status_changes";
import call_logs from "./call_logs";
import agent_call_counts from "./agent_call_counts";
import outbound_report from "./outbound_report";
import call_distribution from "../modules/call-distribution/reducer";
import queues from "./queues";
import ivrs from "./ivrs";
import agent_groups from "./agent_groups";
import locations from "../modules/location-tracker/reducer";
import user_locations from "../modules/location-tracker/user_locations";
import location_history from "../modules/location-tracker/location_history";
import dashboards from "../modules/dashboards/reducer";
import agent_break_configs from "./agent_break_configs";
import groups_3cx from "./groups_3cx";
import field_layout from "../modules/field-layout/reducer";
import disposition_categories from "../modules/disposition/reducers/categories";
import disposition_data from "../modules/call-log-disposition/reducer.js";
import disposition_notes from "../modules/disposition/reducers/notes";
import phone_status from "./phone-status";
import sms_templates from "../modules/sms-templates/reducer";
import call_logs_record from "../modules/call-log-record/reducer";
import deleted_campaigns from "../modules/campaign-archive/reducer.js";
import schedule_reports from "../modules/report-automation/reducer";
import email_templates from "../modules/email-templates/reducer";
import outbound_cli from "../modules/outbound-cli/reducers/oubound_cli.js";
import cli_list from "../modules/outbound-cli/reducers/cli_list.js";
import chat_messages from "../modules/chat-message/reducer";
import disposition_templates from "../modules/disposition-note-templates/reducer";
import disposition_classes from "../modules/disposition-classes/reducer";
import dispositions from "../modules/dispositions/reducer";
import disposition_plans from "../modules/disposition-plans/reducer";
import followup_templates from "../modules/followup-note-templates/reducer";
import service_configs from "../modules/service-configurations/reducer";
import crm from "../modules/crm/reducer.js";
import dnc from "../modules/dnc/reducer";
import disposition_forms from "../modules/disposition-forms/reducer";
import disposition_form_mapping from "../modules/disposition-form-mapping/reducer";
import user_status from "./user_status";
import call_details from "./call_details";
import outbound_ids from "./outbound_ids";
import dispostion_report from "./dispostion_report";
import dispostion_reports from "../modules/disposition-reports/reducer";
import line_status from "../modules/line-status/reducer";
import campaign_summary from "./campaign_summary";
import abandoned_calls from "./abandoned_calls";
import call_data from "./call_data";
import login_history from "./login_history";
import { CUSTOM } from "../custom";
import crm_forms from "../modules/crm-forms/reducer";
import agents_call_summary from "./agent_call_summary";
import sms_report from "./sms_report";
import queue_calls from "./queue_calls.js";
import background_process from "./background_process.js";


const client_reducers = {};

if (CUSTOM && CUSTOM.REDUCERS) {
    for (let i = 0; i < CUSTOM.REDUCERS.length; i++) {
        const module = CUSTOM.REDUCERS[i];
        client_reducers[module.name] = require(`../modules/${module.path}`).default;
    }
}

const rootReducer = combineReducers({
    user,
    user_status,
    metadata,
    form,
    toastr,
    users,
    groups,
    facility,
    facilities,
    leadstatus,
    campaigns,
    roles,
    permissions,
    configurations,
    followups,
    agent_configs,
    group_configs,
    templates,
    outbound_cli,
    kpi_report,
    call_counts,
    call_distribution,
    agent_performance,
    line_status,
    reports,
    images,
    agent_activity_tmpl,
    agents,
    agent_activities,
    agent_activity_report,
    login_history,
    queue_statistics,
    agent_etiquettes,
    feedback_meta,
    feedback_report,
    agent_monitor_data,
    agent_activity_logs,
    agent_status_changes,
    call_logs,
    queues,
    locations,
    dashboards,
    ivrs,
    schedule_reports,
    agent_groups,
    user_locations,
    agent_break_configs,
    groups_3cx,
    location_history,
    field_layout,
    disposition_categories,
    disposition_data,
    disposition_notes,
    disposition_plans,
    disposition_classes,
    ...dispositions,
    sms_templates,
    call_logs_record,
    deleted_campaigns,
    email_templates,
    disposition_templates,
    followup_templates,
    agent_call_counts,
    phone_status,
    queue_configs,
    call_details,
    outbound_ids,
    outbound_report,
    ...crm,
    service_configs,
    dnc,
    dispostion_report,
    dispostion_reports,
    campaign_summary,
    disposition_forms,
    disposition_plans: disposition_form_mapping,
    abandoned_calls,
    call_data,
    campaign_filters,
    crm_forms,
    ...client_reducers,
    agents_call_summary,
    chat_messages,
    sms_report,
    queue_calls,
    background_process,
    cli_list
});

export default rootReducer;
