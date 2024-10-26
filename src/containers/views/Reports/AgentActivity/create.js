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
  getActivitySummaryByAgents,
  getCallSummaryByAgents,
  getAfterCallTime,
  getHoldTime,
  loadAgents,
} from "../../../../actions/reports";

import { loadCampaigns, loadCampaignHistory } from "../../../../actions/campaigns";
import _ from "lodash";
import moment from "moment";
import classnames from "classnames";
import Select from "react-select";
import DateTimeRangePicker from "../../../../components/DateTimeRangePicker";
import { checkPermission } from "../../../../config/util";
import ReportScheduleButton from '../../../../modules/report-automation/views/button';
import { listQueues, list3cxGroups } from "../../../../actions/configurations";
import { SHOW_ACTIVITY_SUMMARY_BY_CAMPAIGN, SHOW_HOLD_TIME, SHOW_WRAP_TIME } from "../../../../config/globals";

class AgentActivityRptCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extensions: [],
      campaigns: [],
      allExtensions: false,
      duration_start: moment(),
      duration_end: moment(),
      searchType: "date",
      activeTab: "date",
      campaignTabAccess: false,
      scale: null,
      group: [],
      queues: [],
      allQueueExtensions: false,
      allgroupExtensions: false
    };
  }

  componentWillMount() {
    this.props.list3cxGroups();
    this.props.loadAgents();
    if (SHOW_ACTIVITY_SUMMARY_BY_CAMPAIGN && checkPermission("Campaigns Management", "READ")) {
      this.setState({ campaignTabAccess: true });
      this.props.listQueues();
      this.props.loadCampaigns();
    }

  }

  async reportFilters() {
    const { allExtensions, searchType, campaigns, group, scale } = this.state;

    let extensions = this.state.extensions;


    if (this.state.extensions) {
      extensions = this.state.extensions.map(item => item.AgentExtension);
      extensions = extensions.join(" ");
    }

    if (this.state.allExtensions) {
      extensions = this.props.agents.map(item => item.AgentExtension);
      extensions = extensions.join(" ");
    }

    if (this.state.group && this.state.group.length) {
      let extensionsSet = new Set();

      this.state.group.forEach(item => {
        item.extensions.forEach(extension => {
          extensionsSet.add(extension);
        });
      });
      extensions = Array.from(extensionsSet);
      extensions = extensions.join(" ");

      if (!extensions) {
        extensions = "0"
      }
    }

    if (this.state.queues && this.state.queues.length) {
      let extensionsSet = new Set();

      this.state.queues.forEach(item => {
        item.extensions.forEach(extension => {
          extensionsSet.add(extension);
        });
      });

      extensions = Array.from(extensionsSet);
      extensions = extensions.join(" ");

      if (!extensions) {
        extensions = "0"
      }
    }

    if (this.state.allQueueExtensions) {
      let allExtensions = [];

      this.props.queues.forEach(queue => {
        allExtensions.push(queue.extension);
        if (queue.extensions) {
          allExtensions = allExtensions.concat(queue.extensions);
        }
      });

      let uniqueExtensions = [...new Set(allExtensions)];
      extensions = uniqueExtensions.join(" ");
    }

    if (this.state.allgroupExtensions) {

      let extensionsSet = new Set();

      this.props.groups_3cx.forEach(item => {
        item.extensions.forEach(extension => {
          extensionsSet.add(extension);
        });
      });
      extensions = Array.from(extensionsSet);
      extensions = extensions.join(" ");
    }

    if (!extensions) {
      return null; // If no extensions selected and not selecting all, return null
    }

    if (searchType === "date") {
      return [{
        agent_extension: extensions,
        start_time: this.state.duration_start.format("YYYY-MM-DD HH:mm:ss"),
        end_time: this.state.duration_end.format("YYYY-MM-DD HH:mm:ss"),
        time_scale: scale ? scale.value : null
      }];
    }

    if (searchType === "campaign") {

      if (!campaigns || !campaigns.campign_id) {
        return null; // Return null if no campaigns selected
      }

      return await new Promise((resolve) => {
        this.props.loadCampaignHistory(campaigns.campign_id, (err, history) => {
          if (!err) {
            resolve(history.map((a) => {
              const queue = _.find(this.props.queues, { extension: a.queue });
              return {
                agent_extension: (allExtensions ? queue.extensions : _.intersection(extensions.split(" "), queue.extensions)).join(" "),
                start_time: a.campaign_start_time,
                end_time: a.campaign_stop_time || moment().format("YYYY-MM-DD HH:mm:ss")
              };
            }))
          }
        })
      });
    }

    return null;
  }


  async generateReport() {
    const self = this;
    this.setState({ isLoading: true });
    const filters = await this.reportFilters();

    if (filters && filters.length) {
      this.props.getActivitySummaryByAgents(filters, () => {
        filters.forEach(f => {
          if (f.time_scale) {
            f.time_scale = f.time_scale.toLowerCase();
          } else {
            f.time_scale = ""
          }
        });

        this.props.getCallSummaryByAgents(filters, () => {
          Promise.all([
            // new Promise((resolve) => {
            //   if (SHOW_WRAP_TIME) {
            //     self.props.getAfterCallTime(filters, () => {
            //       resolve()
            //     });
            //   } else {
            //     resolve()
            //   }
            // }),
            // new Promise((resolve) => {
            //   if (SHOW_HOLD_TIME) {
            //     self.props.getHoldTime(filters, () => {
            //       resolve()
            //     });
            //   } else {
            //     resolve()
            //   }
            // })
          ]).then(() => {
            self.setState({ isLoading: false });
            if (self.state.searchType === "campaign") {
              self.props.onCreated(filters[0].time_scale, this.state.campaigns)
            } else {
              self.props.onCreated(filters[0].time_scale, null)
            }
          })
        })
      });
    } else {
      alert("Please fill all the fields");
      this.setState({ isLoading: false });
    }
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
          {
            this.props.groups_3cx && this.props.groups_3cx.length != 0 && (
              <FormGroup>
                <Label htmlFor="name">Group</Label>
                <Select
                  value={this.state.group}
                  options={this.props.groups_3cx}
                  onChange={(e) => this.setState({ group: e })}
                  className="multi-select"
                  isMulti={true}
                  getOptionValue={(option) => option["id"]}
                  getOptionLabel={(option) => option["name"]}
                  isClearable={true}
                  isDisabled={this.state.allExtensions || (this.state.extensions && this.state.extensions.length !== 0) || this.state.allQueueExtensions || this.state.allgroupExtensions || (this.state.queues && this.state.queues.length !== 0)}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.allgroupExtensions}
                      disabled={(this.state.queues && this.state.queues.length !== 0) || (this.state.extensions && this.state.extensions.length !== 0) || this.state.allQueueExtensions || this.state.allExtensions}
                      onChange={() =>
                        this.setState({
                          allgroupExtensions: !this.state.allgroupExtensions,
                        })
                      }
                    />
                    Select all Groups
                  </Label>
                </FormGroup>
              </FormGroup>
            )
          }

          {
            this.props.queues && this.props.queues.length != 0 && (
              <FormGroup>
                <Label htmlFor="name">Queue</Label>
                <Select
                  value={this.state.queues}
                  options={this.props.queues}
                  onChange={(e) => this.setState({ queues: e })}
                  isMulti={true}
                  getOptionValue={(option) => option["extension"]}
                  getOptionLabel={(option) => option["display_name"]}
                  className="multi-select"
                  isDisabled={this.state.allExtensions || (this.state.extensions && this.state.extensions.length !== 0) || this.state.allQueueExtensions || this.state.allgroupExtensions || (this.state.group && this.state.group.length !== 0)}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.allQueueExtensions}
                      disabled={(this.state.group && this.state.group.length !== 0) || (this.state.extensions && this.state.extensions.length !== 0) || this.state.allgroupExtensions || this.state.allExtensions}
                      onChange={() =>
                        this.setState({
                          allQueueExtensions: !this.state.allQueueExtensions,
                        })
                      }
                    />
                    Select all Queues
                  </Label>
                </FormGroup>
              </FormGroup>
            )
          }

          <FormGroup>
            <Label htmlFor="name">Agents</Label>
            <Select
              value={this.state.extensions}
              options={this.props.agents}
              onChange={(e) => this.setState({ extensions: e })}
              isMulti={true}
              getOptionValue={option => option['AgentID']}
              getOptionLabel={option => option['AgentName']}
              className="multi-select"
              isDisabled={this.state.allExtensions || this.state.allQueueExtensions || this.state.allgroupExtensions || (this.state.group && this.state.group.length !== 0) || (this.state.queues && this.state.queues.length !== 0)}
            />
            <FormGroup check>
              <Label check>
                <Input disabled={(this.state.group && this.state.group.length !== 0) || this.state.allgroupExtensions || this.state.allQueueExtensions} checked={this.state.allExtensions} onChange={() => this.setState({ allExtensions: !this.state.allExtensions })} type="checkbox" />{' '}
                Select all Agents
              </Label>

            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label>Interval</Label>
            <Select
              value={this.state.scale}
              options={[
                { value: 'h', label: 'Hourly' },
                { value: 'd', label: 'Daily' },
                { value: 'm', label: 'Monthly' },
                { value: 'y', label: 'Yearly' },
              ]}
              onChange={(e) => this.setState({ scale: e })}
              isMulti={false}
              isClearable={true}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm="2">
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
          {this.state.campaignTabAccess && this.props.queues ?
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
                          options={(this.props.campaigns || []).filter(a => (a.last_ends_on))}
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
                          getOptionValue={(option) => option["AgentExtension"]}
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
                    <Col sm="2">
                      <ReportScheduleButton api={"getAgentData"} data={this.reportFilters()} />
                    </Col>
                    <Col className="text-right">
                      <Button disabled={this.state.isLoading || !this.props.queues || !this.props.queues.length} onClick={() => this.generateReport()} color="primary">
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
  campaigns,
  queues,
  groups_3cx

}) {
  return {
    agents,
    campaigns,
    queues,
    groups_3cx
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadCampaignHistory,
      loadAgents,
      loadCampaigns,
      getActivitySummaryByAgents,
      getCallSummaryByAgents,
      getAfterCallTime,
      getHoldTime,
      listQueues,
      list3cxGroups
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AgentActivityRptCreate);
