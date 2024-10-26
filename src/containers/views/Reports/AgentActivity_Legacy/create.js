import React, { Component } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Button,
  Input,
  NavItem,
  NavLink,
  Nav,
  TabContent,
  TabPane,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  loadKPIReport,
  loadAgentActivityTemplates,
  loadAgentActivities,
  loadAgents,
  deleteAgentActivityTemplates,
  loadAgentActivityReport,
  loadAgentActivityReportByTemplate,
} from "../../../../actions/reports";

import { loadCampaigns } from "../../../../actions/campaigns";
import _ from "lodash";
import moment from "moment";
import classnames from "classnames";
import Select from "react-select";
import DateTimeRangePicker from "../../../../components/DateTimeRangePicker";
import { checkPermission } from "../../../../config/util";
import ReportScheduleButton from '../../../../modules/report-automation/views/button';

class AgentActivityRptCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extensions: [],
      statuses: [],
      groups: [],
      campaigns: [],
      allExtensions: false,
      allStatuses: false,
      duration_start: moment(),
      duration_end: moment(),
      template_name: "",
      saveTemplate: false,
      searchType: "date",
      activeTab: "date",
      loggedUser: "",
      campaignTabAccess: false,
    };
  }

  componentWillMount() {
    if (checkPermission("Campaigns Management", "READ")) {
      this.setState({ campaignTabAccess: true });
      this.props.loadCampaigns();
    }
    this.props.loadAgents();
    this.props.loadAgentActivities();
    this.props.loadAgentActivityTemplates();
  }

  reportFilters() {
    const { extensions, statuses, allExtensions, allStatuses, searchType, campaigns } = this.state;
  
    if (!allExtensions && !extensions.length) {
      return null; // If no extensions selected and not selecting all, return null
    }
  
    if (!allStatuses && !statuses.length) {
      return null; // If no statuses selected and not selecting all, return null
    }
  
    if (searchType === "date") {
      return {
        TemplateName: this.state.saveTemplate ? this.state.template_name : null,
        Agents: allExtensions ? _.map(this.props.agents, "AgentID") : _.map(extensions, "AgentID"),
        Statuses: allStatuses ? _.map(this.props.agent_activities, "id") : _.map(statuses, "id"),
        Duration: {
          startTime: this.state.duration_start.format("YYYY-MM-DD HH:mm:ss"),
          endTime: this.state.duration_end.format("YYYY-MM-DD HH:mm:ss"),
        },
      };
    }
  
    if (searchType === "campaign") {
      if (!campaigns || !campaigns.campign_id) {
        return null; // Return null if no campaigns selected
      }
      
      const campaign_id = campaigns.campign_id;
      
      return {
        TemplateName: this.state.saveTemplate ? this.state.template_name : null,
        Agents: allExtensions ? _.map(this.props.agents, "AgentID") : _.map(extensions, "AgentID"),
        Statuses: allStatuses ? _.map(this.props.agent_activities, "id") : _.map(statuses, "id"),
        campaign_id: campaign_id,
      };
    }
  
    return null;
  }
  

  generateReport() {
    this.setState({ isLoading: true });

    if (this.state.template) {
      this.props.loadAgentActivityReportByTemplate(
        {
          Template_Id: parseInt(this.state.template, 10),
          Duration: {
            startTime: this.state.duration_start.format("YYYY-MM-DD 00:00:00"),
            endTime: this.state.duration_end.format("YYYY-MM-DD 23:59:59"),
          },
        },
        () => {
          this.setState({ isLoading: false });
        }
      );
    } else {
      const filters = this.reportFilters();

      if (filters) {
        this.props.loadAgentActivityReport(filters, () => {
          this.setState({ isLoading: false });
        });
      } else {
        alert("Please fill all the fields");
        this.setState({ isLoading: false });
      }
    }
  }

  deleteTmpl(e) {
    if (window.confirm("Are you sure, you want to delete this template?")) {
      this.props.deleteAgentActivityTemplates(e);
    }
  }

  getAgentGroups() {
    let groups = _.map(this.props.agents, "AgentGroup");
    groups = _.uniq(groups);
    return _.map(groups, (a) => ({
      value: a,
      label: a,
    }));
  }

  selectGroup(e) {
    const extensions = _.filter(this.props.agents, (a) => {
      return _.map(e, "value").indexOf(a.AgentGroup) > -1;
    });

    this.setState({ groups: e, extensions });
  }


  renderForm() {
    return <div>
      <DateTimeRangePicker
        startDate={this.state.duration_start}
        endDate={this.state.duration_end}
        onDatesChange={({ startDate, endDate }) =>
          this.setState({
            duration_start: startDate,
            duration_end: endDate,
          })
        }
      />
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label htmlFor="name">Agents</Label>
            <Select
              value={this.state.extensions}
              options={this.props.agents}
              onChange={(e) => this.setState({ extensions: e })}
              isMulti={true}
              getOptionValue={(option) => option["AgentID"]}
              getOptionLabel={(option) => option["AgentName"]}
              className="multi-select"
              isDisabled={this.state.allExtensions}
            />
            <FormGroup check>
              <Label check>
                <Input
                  checked={this.state.allExtensions}
                  onChange={() =>
                    this.setState({
                      allExtensions: !this.state.allExtensions,
                    })
                  }
                  type="checkbox"
                />{" "}
                Select all Agents
              </Label>
            </FormGroup>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <FormGroup>
            <Label htmlFor="name">Statuses</Label>
            <Select
              value={this.state.statuses}
              options={this.props.agent_activities}
              onChange={(e) => this.setState({ statuses: e })}
              isMulti={true}
              getOptionValue={(option) => option["id"]}
              getOptionLabel={(option) => option["status_name"]}
              className="multi-select"
              isDisabled={this.state.allStatuses}
            />
            <FormGroup check>
              <Label check>
                <Input
                  checked={this.state.allStatuses}
                  onChange={() =>
                    this.setState({
                      allStatuses: !this.state.allStatuses,
                    })
                  }
                  type="checkbox"
                />{" "}
                Select all Statuses
              </Label>
            </FormGroup>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <ReportScheduleButton api={"getAgentData"} data={this.reportFilters()} />
        </Col>
        <Col className="text-right">
          <Button onClick={() => this.generateReport()} color="primary">
            {this.state.isLoading ? (
              <i className="fa fa-spin fa-circle-o-notch"></i>
            ) : (
              ""
            )}{" "}
            Generate Report
          </Button>
        </Col>
      </Row>
    </div>
  }

  render() {
    return (
      <Card className="mr-3" style={{ flexShrink: 0, width: 300 }}>
        <CardHeader>Report Settings</CardHeader>
        <CardBody>
          {this.state.campaignTabAccess ?
            <div>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.searchType === "date",
                    })}
                    onClick={() => {
                      this.setState({
                        searchType: "date",
                      });
                    }}
                  >
                    Date
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.searchType === "campaign",
                    })}
                    onClick={() => {
                      this.setState({
                        searchType: "campaign",
                      });
                    }}
                  >
                    Campaign
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={this.state.searchType}>
                <TabPane tabId="date">
                  {this.renderForm()}
                </TabPane>
                <TabPane tabId="campaign">
                  <Row>
                    <Col xs="12">
                      <FormGroup>
                        <Label htmlFor="name">Campaign</Label>
                        <Select
                          value={this.state.campaigns}
                          options={this.props.campaigns}
                          onChange={(e) => this.setState({ campaigns: e })}
                          isMulti={false}
                          getOptionValue={(option) => option["campign_id"]}
                          getOptionLabel={(option) => option["campaign_name"]}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs="12">
                      <FormGroup>
                        <Label htmlFor="name">Agents</Label>
                        <Select
                          value={this.state.extensions}
                          options={this.props.agents}
                          onChange={(e) => this.setState({ extensions: e })}
                          isMulti={true}
                          getOptionValue={(option) => option["AgentID"]}
                          getOptionLabel={(option) => option["AgentName"]}
                          className="multi-select"
                          isDisabled={this.state.allExtensions}
                        />
                        <FormGroup check>
                          <Label check>
                            <Input
                              checked={this.state.allExtensions}
                              onChange={() =>
                                this.setState({
                                  allExtensions: !this.state.allExtensions,
                                })
                              }
                              type="checkbox"
                            />{" "}
                            Select all Agents
                          </Label>
                        </FormGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs="12">
                      <FormGroup>
                        <Label htmlFor="name">Statuses</Label>
                        <Select
                          value={this.state.statuses}
                          options={this.props.agent_activities}
                          onChange={(e) => this.setState({ statuses: e })}
                          isMulti={true}
                          getOptionValue={(option) => option["id"]}
                          getOptionLabel={(option) => option["status_name"]}
                          className="multi-select"
                          isDisabled={this.state.allStatuses}
                        />
                        <FormGroup check>
                          <Label check>
                            <Input
                              checked={this.state.allStatuses}
                              onChange={() =>
                                this.setState({
                                  allStatuses: !this.state.allStatuses,
                                })
                              }
                              type="checkbox"
                            />{" "}
                            Select all Statuses
                          </Label>
                        </FormGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <ReportScheduleButton api={"getAgentData"} data={this.reportFilters()} />
                    </Col>
                    <Col className="text-right">
                      <Button onClick={() => this.generateReport()} color="primary">
                        {this.state.isLoading ? (
                          <i className="fa fa-spin fa-circle-o-notch"></i>
                        ) : (
                          ""
                        )}{" "}
                        Generate Report
                      </Button>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </div> : this.renderForm()}
        </CardBody>
      </Card>
    );
  }
}

function mapStateToProps({
  agents,
  agent_activities,
  agent_activity_tmpl,
  campaigns,
}) {
  return {
    agents,
    agent_activities,
    agent_activity_tmpl,
    campaigns,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadAgents,
      loadCampaigns,
      loadAgentActivities,
      loadKPIReport,
      loadAgentActivityTemplates,
      deleteAgentActivityTemplates,
      loadAgentActivityReport,
      loadAgentActivityReportByTemplate,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AgentActivityRptCreate);
