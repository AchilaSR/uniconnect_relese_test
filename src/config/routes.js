import React from 'react';
import Loadable from 'react-loadable';

// import Home from '../containers/Home';
import Loader from '../components/Loader';
import { CUSTOM } from '../custom';
import { DISPOSITION_REPORT_TYPE, LEGACY_ACTIVITY_SUMMARY_REPORT } from "./globals";
const report_type = DISPOSITION_REPORT_TYPE
function Loading() {
  return <Loader />;
}

const Dashboard = Loadable({
  loader: () => import('../containers/views/Dashboard/index'),
  loading: Loading,
});

const Campaigns = Loadable({
  loader: () => import('../containers/views/Campaigns/index'),
  loading: Loading,
});

const NewCampaign = Loadable({
  loader: () => import('../containers/views/Campaigns/create'),
  loading: Loading,
});

const Facilities = Loadable({
  loader: () => import('../containers/views/Facilities/index'),
  loading: Loading,
});

const CampaignFacilities = Loadable({
  loader: () => import('../containers/views/Facilities/campaign-leads'),
  loading: Loading,
});

const DialFacility = Loadable({
  loader: () => import('../containers/views/Facilities/view'),
  loading: Loading,
});

const FollowUps = Loadable({
  loader: () => import('../containers/views/FollowUps/index'),
  loading: Loading,
});

const Users = Loadable({
  loader: () => import('../containers/views/Users/index'),
  loading: Loading,
});

const Roles = Loadable({
  loader: () => import('../containers/views/Roles/index'),
  loading: Loading,
});

const Reports = Loadable({
  loader: () => import('../containers/views/Reports/KPIReports'),
  loading: Loading,
});

const Extensions = Loadable({
  loader: () => import('../containers/views/Configurations/Extentions/index'),
  loading: Loading,
});

const AgentConfigs = Loadable({
  loader: () => import('../containers/views/Configurations/AgentConfigs/index'),
  loading: Loading,
});

const QueueConfigs = Loadable({
  loader: () => import('../containers/views/Configurations/QueueConfigs/index'),
  loading: Loading,
});

const GroupConfigs = Loadable({
  loader: () => import('../containers/views/Configurations/GroupConfigs/index'),
  loading: Loading,
});

const Groups = Loadable({
  loader: () => import('../containers/views/Groups/index'),
  loading: Loading,
});

const Templates = Loadable({
  loader: () => import('../containers/views/Templates/index'),
  loading: Loading,
});

const OutboundCli = Loadable({
  loader: () => import('../modules/outbound-cli/views/index'),
  loading: Loading,
});

const CampaignArchive = Loadable({
  loader: () => import('../modules/campaign-archive/view/index'),
  loading: Loading,
});

const ScheduleReport = Loadable({
  loader: () => import('../modules/report-automation/views/index'),
  loading: Loading,
});
const CallDistribution = Loadable({
  loader: () => import('../modules/call-distribution/views/index'),
  loading: Loading,
});

const DialerReports = Loadable({
  loader: () => import('../containers/views/Reports/DialerReports'),
  loading: Loading,
});

let DispositionReports;
if (report_type === "col") {
  DispositionReports = Loadable({
    loader: () => import('../containers/views/Reports/DispositionReports'),
    loading: Loading,
  });
} else {
  DispositionReports = Loadable({
    loader: () => import('../modules/disposition-reports/views/index'),
    loading: Loading,
  });
}

const CampaignSummary = Loadable({
  loader: () => import('../containers/views/Reports/CampaignSummary'),
  loading: Loading,
});

const KPIAnalyzer = Loadable({
  loader: () => import('../containers/views/Reports/KPIReports'),
  loading: Loading,
});

const AgentPerformance = Loadable({
  loader: () => import('../containers/views/Reports/AgentPerformance'),
  loading: Loading,
});

let AgentActivity = Loadable({
  loader: () => import('../containers/views/Reports/AgentActivity'),
  loading: Loading,
});

if (LEGACY_ACTIVITY_SUMMARY_REPORT) {
  Loadable({
    loader: () => import('../containers/views/Reports/AgentActivity_Legacy'),
    loading: Loading,
  });
}


const QueueStatistics = Loadable({
  loader: () => import('../containers/views/Reports/QueueStatistics'),
  loading: Loading,
});

const AbandonedCalls = Loadable({
  loader: () => import('../containers/views/Reports/AbandonedCalls'),
  loading: Loading,
});

const AgentEtiquettes = Loadable({
  loader: () => import('../containers/views/Reports/AgentEtiquettes'),
  loading: Loading,
});


const CustomerFeedback = Loadable({
  loader: () => import('../containers/views/Reports/CustomerFeedback'),
  loading: Loading,
});

const AgentMonitor = Loadable({
  loader: () => import('../containers/views/Reports/ActivityMonitor'),
  loading: Loading,
});

const ActivityReport = Loadable({
  loader: () => import('../containers/views/Reports/ActivityReport'),
  loading: Loading,
});

const LoginHistory = Loadable({
  loader: () => import('../containers/views/Reports/LoginHistory'),
  loading: Loading,
});

const CallLogs = Loadable({
  loader: () => import('../containers/views/Reports/CallLogs'),
  loading: Loading,
});

const LocationTracker = Loadable({
  loader: () => import('../modules/location-tracker/views/tracker'),
  loading: Loading,
});

const LocationHistory = Loadable({
  loader: () => import('../modules/location-tracker/views/location-history'),
  loading: Loading,
});

const MessageHistory = Loadable({
  loader: () => import('../modules/location-tracker/views/message-history'),
  loading: Loading,
});

const CallStats = Loadable({
  loader: () => import('../modules/dashboards/views/index'),
  loading: Loading,
});

const CallStatsDashboard = Loadable({
  loader: () => import('../modules/dashboards/views/dashboard'),
  loading: Loading,
});

const StatusConfig = Loadable({
  loader: () => import('../containers/views/Configurations/AgentStatus/views'),
  loading: Loading,
});

const FieldLayout = Loadable({
  loader: () => import('../modules/field-layout/views/index'),
  loading: Loading,
});
const UploadLeads = Loadable({
  loader: () => import('../modules/leads/views/upload'),
  loading: Loading,
});

const SMSTemplates = Loadable({
  loader: () => import('../modules/sms-templates/views/index'),
  loading: Loading,
});

const EmailTemplates = Loadable({
  loader: () => import('../modules/email-templates/views/index'),
  loading: Loading,
});

const FollowUpTemplates = Loadable({
  loader: () => import('../modules/followup-note-templates/views/index'),
  loading: Loading,
});

const DispositionTemplates = Loadable({
  loader: () => import('../modules/disposition-note-templates/views/index'),
  loading: Loading,
});

const Disposition = Loadable({
  loader: () => import('../modules/disposition/views/index'),
  loading: Loading,
});

const DispositionClasses = Loadable({
  loader: () => import('../modules/disposition-classes/views/index'),
  loading: Loading,
});

const Dispositions = Loadable({
  loader: () => import('../modules/dispositions/views/index'),
  loading: Loading,
});

const DispositionPlans = Loadable({
  loader: () => import('../modules/disposition-plans/views/index'),
  loading: Loading,
});

const CallCounts = Loadable({
  loader: () => import('../containers/views/Reports/CallCounts'),
  loading: Loading,
});

const Crm = Loadable({
  loader: () => import('../modules/crm/views/index'),
  loading: Loading,
});

const CrmFieldSettings = Loadable({
  loader: () => import('../modules/crm/views/field-settings'),
  loading: Loading,
});

const ContactView = Loadable({
  loader: () => import('../modules/crm/views/contact/index'),
  loading: Loading,
});

const AccountView = Loadable({
  loader: () => import('../modules/crm/views/account/index'),
  loading: Loading,
});

const MessengerConfigurations = Loadable({
  loader: () => import('../modules/messenger/views/configurations'),
  loading: Loading,
});

const Inbox = Loadable({
  loader: () => import('../modules/messenger/views/inbox'),
  loading: Loading,
});

const ServiceConfigurations = Loadable({
  loader: () => import('../modules/service-configurations/views/index'),
  loading: Loading,
});

const DncManagement = Loadable({
  loader: () => import('../modules/dnc/views/index'),
  loading: Loading,
});

const OutboundReport = Loadable({
  loader: () => import('../containers/views/Reports/OutboundReport'),
  loading: Loading,
});

const CallDataReport = Loadable({
  loader: () => import('../containers/views/Reports/CallData/index'),
  loading: Loading,
});

const PollingAttempts = Loadable({
  loader: () => import('../containers/views/Reports/PollingAttempts'),
  loading: Loading,
});

const DispositionForms = Loadable({
  loader: () => import('../modules/disposition-forms/views/index'),
  loading: Loading,
});


const DispositionFormMapping = Loadable({
  loader: () => import('../modules/disposition-form-mapping/views/index'),
  loading: Loading,
});

const ScheduledReports = Loadable({
  loader: () => import('../modules/report-automation/views/index'),
  loading: Loading,
});

const CRMForms = Loadable({
  loader: () => import('../modules/crm-forms/views/index'),
  loading: Loading,
});

const CampaignMonitoring = Loadable({
  loader: () => import('../containers/views/Campaigns/monitoring'),
  loading: Loading,
});


const routes = [
  { path: '/dashboard', name: 'Dashboard', component: CallStats, exact: true, isAuth: true },
  { path: '/campaigns', name: 'Campaigns', component: Campaigns, exact: true, isAuth: true },
  { path: '/campaigns/new', name: 'New Campaign', component: NewCampaign, isAuth: true },
  { path: '/leads', name: 'Leads', component: Facilities, exact: true, isAuth: true },
  { path: '/leads/campaign', name: 'Leads', component: CampaignFacilities, exact: true, isAuth: true },
  { path: '/leads/dial', name: 'Leads Details', component: DialFacility, isAuth: true },
  { path: '/followups', name: 'Follow Ups', component: FollowUps, isAuth: true },
  { path: '/extensions', name: 'Extensions', component: Extensions, isAuth: true },
  { path: '/users', name: 'Users', component: Users, isAuth: true },
  { path: '/reports', name: 'Reports', component: Reports, isAuth: true },
  { path: '/roles', name: 'Roles', component: Roles, isAuth: true },
  { path: '/groups', name: 'Groups', component: Groups, isAuth: true },
  { path: '/group-configs', name: 'Group', component: GroupConfigs },
  { path: '/agent-configs', name: 'Agent', component: AgentConfigs },
  { path: '/queue-configs', name: 'Queue Configurations', component: QueueConfigs },
  { path: '/service-configs', name: 'Service Configurations', component: ServiceConfigurations },
  { path: '/templates', name: 'Templates', component: Templates },
  { path: '/outbound-cli', name: 'Outbound CLI Management', component: OutboundCli },
  { path: '/campaign-archive', name: 'Campaign Archive', component: CampaignArchive },
  { path: '/campaign/:id/monitor', name: 'Campaign Monitor', component: CampaignMonitoring },
  { path: '/schedule-report', name: 'Schedule Report', component: ScheduleReport },
  { path: '/call-distribution', name: 'Call Distribution', component: CallDistribution },
  { path: '/dialer-reports', name: 'Dialer Reports', component: DialerReports },
  { path: '/disposition-reports', name: 'Disposition Reports', component: DispositionReports },
  { path: '/campaign-summary', name: 'Campaign Summary', component: CampaignSummary },
  { path: '/kpi-analyzer', name: 'KPI Analyzer', component: KPIAnalyzer },
  { path: '/agent-performance', name: 'Agent Performance', component: AgentPerformance },
  { path: '/queue-statistics', name: 'Queue Statistics', component: QueueStatistics },
  { path: '/abandoned-calls', name: 'Abandoned Calls', component: AbandonedCalls },
  { path: '/call-data', name: 'Call Data', component: CallDataReport },
  { path: '/polling-attempts', name: 'Polling Statistics', component: PollingAttempts },
  { path: '/agent-activity', name: 'Agent Activity', component: AgentActivity },
  { path: '/agent-etiquettes', name: 'Agent Etiquettes', component: AgentEtiquettes },
  { path: '/agent-monitor', name: 'Agent Activity', component: AgentMonitor },
  { path: '/activity-report', name: 'Agent Activity', component: ActivityReport },
  { path: '/login-history', name: 'Login History', component: LoginHistory },
  { path: '/agent-activity', name: 'Agent Activity', component: AgentActivity },
  { path: '/customer-feedback', name: 'Customer Feedback', component: CustomerFeedback },
  { path: '/call-logs', name: 'Call Logs', component: CallLogs },
  { path: '/location-tracker', name: 'Location Tracker', component: LocationTracker },
  { path: '/location-history', name: 'Location History', component: LocationHistory },
  { path: '/message-history', name: 'Message History', component: MessageHistory },
  { path: '/dashboard', name: 'Dashboards', component: CallStats, exact: true },
  { path: '/dashboard/:dbname', name: 'Dashboard', component: CallStatsDashboard },
  { path: '/new-dashboard', name: 'New Dashboard', component: CallStatsDashboard },
  { path: '/status-config', name: 'Status Configurations', component: StatusConfig },
  { path: '/field-layout', name: 'Field Layout', component: FieldLayout },
  { path: '/leads/upload', name: 'Upload Leads', component: UploadLeads },
  { path: '/sms-templates', name: 'SMS Templates', component: SMSTemplates },
  { path: '/email-templates', name: 'Email Templates', component: EmailTemplates },
  { path: '/followup-templates', name: 'Follow Up Note Templates', component: FollowUpTemplates },
  { path: '/disposition-templates', name: 'Disposition Note Templates', component: DispositionTemplates },
  { path: '/disposition-notes', name: 'Disposition Notes', component: Disposition },
  { path: '/disposition-classes', name: 'Disposition Classes', component: DispositionClasses },
  { path: '/dispositions', name: 'Dispositions', component: Dispositions },
  { path: '/disposition-plans', name: 'Disposition Plans', component: DispositionPlans },
  { path: '/call-counts', name: 'Call Counts', component: Dashboard },
  { path: '/crm/:module', name: 'CRM', component: Crm, exact: true },
  { path: '/crm-field-layout', name: 'CRM Field Layout', component: CrmFieldSettings, exact: true },
  { path: '/crm-forms', name: 'CRM Forms', component: CRMForms },
  { path: '/contacts', name: 'Contact', component: ContactView, exact: true },
  { path: '/contacts/:id', name: 'Contact', component: ContactView },
  { path: '/account/:id', name: 'Account', component: AccountView },
  { path: '/channel-config', name: 'Channels', component: MessengerConfigurations },
  { path: '/inbox', name: 'Inbox', component: Inbox },
  { path: '/dnc', name: 'DNC Management', component: DncManagement },
  { path: '/outbound-report', name: 'Outbound Report', component: OutboundReport },
  { path: '/disposition-forms', name: 'Disposition Forms', component: DispositionForms },
  { path: '/disposition-form-mapping', name: 'Disposition Plans', component: DispositionFormMapping },
  { path: '/scheduled-reports', name: 'Scheduled Reports', component: ScheduledReports },
];

const addRoutes = (items) => {
  for (let i = 0; i < items.length; i++) {
    const nav = items[i];
    if (nav.children) {
      addRoutes(nav.children);
    }

    const Screen = Loadable({
      loader: () => import('../modules/' + nav.path),
      loading: Loading,
    });
    _.remove(routes, { path: nav.url });
    routes.push({ path: nav.url, name: nav.name, component: Screen })
  }
}


if (CUSTOM.NAVIGATION) {
  for (let permission in CUSTOM.NAVIGATION) {
    for (let i = 0; i < CUSTOM.NAVIGATION[permission].length; i++) {
      addRoutes(CUSTOM.NAVIGATION[permission]);
    }
  }
}


export default routes;
