import _ from "lodash";
import { CUSTOM } from "../custom";
import { DEBUG_MODE, DYNAMIC_DISPOSITION_FORMS, ENABLE_SCHEDULED_REPORTS, LINK_3CX_CONFIG, LINK_3CX_REPORTS, LINK_CRM_CONFIG, LINK_CRM_REPORTS, CALL_LOGS_OLD } from "./globals";
import { CRM_PERMISSIONS, MODULES, MODULE_ICONS } from "../modules/crm/config";
const getItems = () => {
  let items = [];
  const userData = JSON.parse(localStorage.getItem("lbcc_user"));

  const checkPermission = (name, access) => {
    const perm = _.find(userData.login_rules, { module_name: name });
    if (perm) {
      if (access) {
        return perm[access];
      }
      if (perm.readaccess || perm.writeaccess || perm.editaccess || perm.deleteaccess) {
        return true;
      }
    }
    return false;
  }

  if (userData) {
    if (userData.login_rules.length > 0) {
      if (checkPermission("Dashboard")) {
        items.push({
          name: "Dashboards",
          icon: "fa fa-tachometer",
          url: "/dashboard/default"
        });
      }

      if (checkPermission("Campaigns Management")) {
        items.push({
          name: "Campaigns",
          icon: "fa fa-columns",
          url: "/campaigns"
        });
      }

      const leads = {
        name: "Leads",
        icon: "fa fa-phone-square",
        children: []
      };

      if (checkPermission("Facility Management")) {
        leads.children.push({
          name: "View Lead",
          url: "/leads/dial",
          icon: "fa fa-address-card-o",
        });
      }

      if (checkPermission("Facility Management", "writeaccess")) {
        leads.children.push({
          name: "Lead Details",
          url: "/leads",
          icon: "fa fa-users",
        });
      }


      if (checkPermission("Followups Management", "writeaccess")) {
        leads.children.push({
          name: "Follow Ups",
          url: "/followups",
          icon: "fa fa-bell",
        });
      }

      if (checkPermission("Disposition Management", "readaccess")) {
        leads.children.push({
          name: "Disposition Notes",
          url: "/disposition-notes",
          icon: "fa fa-phone-square",
        })
      }



      if (leads.children.length > 0) {
        items.push(leads);
      }

      //--- need to check permissios ---
      if (Object.values(CRM_PERMISSIONS).some((perm) => checkPermission(perm))) {
        const crm_items = [];

        Object.keys(CUSTOM.CRM_MODULES || MODULES).forEach((org_module) => {
          const module = (CUSTOM.CRM_MODULES || MODULES)[org_module];
          const icon = typeof m === "object" ? m.icon : MODULE_ICONS[org_module];
          if (checkPermission(CRM_PERMISSIONS[org_module])) {
            crm_items.push({
              name: module,
              icon: "fa " + icon,
              url: "/crm/" + org_module
            });
          }
        })

        items.push({
          name: "CRM",
          icon: "fa fa fa-id-card-o",
          children: crm_items
        });
      }
      //--- end permission check ---

      if (CUSTOM.NAVIGATION) {
        Object.keys(CUSTOM.NAVIGATION).forEach(permission => {
          if (checkPermission(permission)) {
            CUSTOM.NAVIGATION[permission].forEach((nav) => {
              if (nav.icon) {
                items.push(nav);
              }
            });
          }
        });
      }


      if (checkPermission("Location Management")) {
        items.push({
          name: "Location Tracking",
          icon: "fa fa-map",
          children: [
            {
              name: "Location Tracker",
              url: "/location-tracker",
              icon: "fa fa-map-marker",
            }, {
              name: "Location List",
              url: "/location-history",
              icon: "fa fa-compass",
            }, {
              name: "Message History",
              url: "/message-history",
              icon: "fa fa-comments-o",
            }]
        });
      }

      if (checkPermission("Reports")) {
        const reports = {
          name: "Reports",
          icon: "fa fa-line-chart",
          children: [],
        }

        const activityReports = {
          name: "Agent Activities",
          icon: "fa fa-clock-o",
          children: [{
            name: "Activity Monitor",
            url: "/agent-monitor",
            icon: "fa fa-bell-o",
          }, {
            name: "Activity Summary",
            url: "/agent-activity",
            icon: "fa fa-clock-o",
          }, {
            name: "Agent Performance",
            url: "/agent-performance",
            icon: "fa fa-bar-chart",
          }, {
            name: "Activity Reports",
            url: "/activity-report",
            icon: "fa fa-calendar",
          }, {
            name: "Login History",
            url: "/login-history",
            icon: "fa fa-exchange",
          }]
        };

        reports.children.push(activityReports);

        const customReports = {
          name: "Call Statistics",
          icon: "fa fa-headphones",
          children: [{
            name: "Call Distribution",
            url: "/call-distribution",
            icon: "fa fa-calendar",
          }, {
            name: "Outbound Report",
            url: "/outbound-report",
            icon: "fa fa-th",
          }, {
            name: "Queue Statistics",
            url: "/queue-statistics",
            icon: "fa fa-volume-control-phone",
          }, {
            name: "Abandoned Calls",
            url: "/abandoned-calls",
            icon: "fa fa-chain-broken",
          }, {
            name: "Polling Statistics",
            url: "/polling-attempts",
            icon: "fa fa-retweet",
          }]
        };

        reports.children.push(customReports);

        if (checkPermission("Unified Messaging")) {
          const messageReports = {
            name: "Unified Messaging",
            url: "/inbox",
            icon: "fa fa-inbox",
          };
          reports.children.push(messageReports);
        }

        if (checkPermission("Campaigns Management")) {
          const campaignReports = {
            name: "Campaign Reports",
            icon: "fa fa-tasks",
            children: [{
              name: "Campaign Summary",
              url: "/campaign-summary",
              icon: "fa fa-tasks",
            }, {
              name: "Disposition Reports",
              url: "/disposition-reports",
              icon: "fa fa-phone-square",
            }]
          };

          reports.children.push(campaignReports);
        }



        if (checkPermission("Customer Feedback")) {
          reports.children.push({
            name: "Customer Feedback",
            url: "/customer-feedback",
            icon: "fa fa-comments",
          });
        }

        if (checkPermission("Call Logs Management")) {
          reports.children.push({
            name: "Call Details",
            url: "/call-data",
            icon: "fa fa-phone",
          });

          if(CALL_LOGS_OLD){
            reports.children.push({
              name: "Call Logs (Deprecated)",
              url: "/call-logs",
              icon: "fa fa-file-text-o",
            });
          }
        }


        if (ENABLE_SCHEDULED_REPORTS) {
          reports.children.push({
            name: "Scheduled Reports",
            url: "/scheduled-reports",
            icon: "fa fa-clock-o",
          });
        }

        if (LINK_3CX_REPORTS) {
          reports.children.push({
            name: "3CX Standard Reports",
            url: LINK_3CX_REPORTS,
            attributes: { target: "_blank", external_link: "true" },
            icon: "fa fa-external-link",
          });
        }

        if (checkPermission("Help Desk") || checkPermission("Contacts Management") || checkPermission("Sales Order Management")) {
          if (LINK_CRM_REPORTS) {
            reports.children.push({
              name: "CRM Reports",
              url: LINK_CRM_REPORTS,
              attributes: { target: "_blank", external_link: "true" },
              icon: "fa fa-ticket",
            });
          }
        }

        items.push(reports);
      } else {
        if (checkPermission("Call Logs Management")) {
          items.push({
            name: "Call Details",
            url: "/call-data",
            icon: "fa fa-phone",
          });

          if(CALL_LOGS_OLD){
            items.push({
              name: "Call Logs (Deprecated)",
              url: "/call-logs",
              icon: "fa fa-file-text-o",
            });
          }
        }
      }

      if (checkPermission("Configurations")) {
        const conf = {
          name: "Configurations",
          icon: "fa fa-cog",
          children: [
            {
              name: "Messaging",
              icon: "fa fa-comments-o",
              children: [
                {
                  name: "SMS Templates",
                  url: "/sms-templates",
                  icon: "fa fa-comment-o",
                },
                {
                  name: "Email Templates",
                  url: "/email-templates",
                  icon: "fa fa-envelope-o",
                }
              ],
            }
          ],
        };

        let campaign_config;

        if (checkPermission("Campaigns Management")) {
          campaign_config = [
            {
              name: "Campaign Templates",
              url: "/templates",
              icon: "fa fa-file-text-o",
            },
            {
              name: "Campaign Field Layout",
              url: "/field-layout",
              icon: "fa fa-address-card-o",
            },
            {
              name: "Outbound CLI Management",
              url: "/outbound-cli",
              icon: "fa fa-phone-square",
            }
          ];

          if (checkPermission("DNC Management")) {
            campaign_config.push({
              name: "DNC Management",
              url: "/dnc",
              icon: "fa fa-ban",
            })
          }
        }

        const disposition_config = [];
        if (checkPermission("Disposition Management")) {
          if (DYNAMIC_DISPOSITION_FORMS) {
            disposition_config.push({
              name: "Disposition Forms",
              url: "/disposition-forms",
              icon: "fa fa-sticky-note-o",
            });
            disposition_config.push({
              name: "Disposition Plans",
              url: "/disposition-form-mapping",
              icon: "fa fa-map-o",
            })
          } else {
            disposition_config.push({
              name: "Disposition Templates",
              url: "/disposition-templates",
              icon: "fa fa-sticky-note-o",
            });
            disposition_config.push({
              name: "Disposition Classes",
              url: "/disposition-classes",
              icon: "fa fa-object-group",
            });
            disposition_config.push({
              name: "Dispositions",
              url: "/dispositions",
              icon: "fa fa-comment-o",
            });
            disposition_config.push({
              name: "Disposition Plans",
              url: "/disposition-plans",
              icon: "fa fa-map-o",
            });
          }
        }

        if (campaign_config) {
          conf.children.push({
            name: "Campaigns",
            icon: "fa fa-columns",
            children: [...campaign_config, ...disposition_config]
          });
        } else if (disposition_config) {
          conf.children.push({
            name: "Disposition Management",
            icon: "fa fa-object-group",
            children: disposition_config
          });
        }

        conf.children.push({
          name: "3CX Configurations",
          icon: "fa fa-phone",
          children: [
            {
              name: "Status Configurations",
              url: "/status-config",
              icon: "fa fa-clock-o",
            }, {
              name: "Service Configurations",
              url: "/service-configs",
              icon: "fa fa-wrench",
            }, {
              name: "Navigate to 3CX",
              url: LINK_3CX_CONFIG,
              attributes: { target: "_blank", external_link: "true" },
              icon: "fa fa-external-link",
            }
          ]
        });



        if (checkPermission("Help Desk") || checkPermission("Contacts Management") || checkPermission("Sales Order Management")) {
          conf.children.push({
            name: "CRM Configurations",
            icon: "fa fa-life-ring",
            children: [{
              name: "CRM Field Layout",
              url: "/crm-field-layout",
              icon: "fa fa-ticket",
            }, {
              name: "Navigate to CRM",
              url: LINK_CRM_CONFIG,
              attributes: { target: "_blank", external_link: "true" },
              icon: "fa fa-external-link",
            }, {
              name: "CRM Form Dependencies",
              url: "/crm-forms",
              icon: "fa fa-sticky-note-o",
            }]
          });
        }
        items.push(conf);
      }


      if (checkPermission("User Management")) {
        const um = {
          name: "User Management",
          icon: "fa fa-user",
          children: [
            {
              name: "Users",
              url: "/users",
              icon: "fa fa-user",
            },
          ],
        }

        if (checkPermission("Role Management")) {
          um.children.push({
            name: "Roles",
            url: "/roles",
            icon: "fa fa-key",
          })
        }
        items.push(um);
      }
    }
  }

  return { items };
}


export default { getItems };
