import React, { Component } from "react";
import {
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Button,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { list3cxGroups } from "../../../../actions/configurations";
import {
  getAgentMonitorData,
  loadAgentActivities,
  getAgentMonitorDataByQueue,
} from "../../../../actions/reports";
import { listQueues } from "../../../../actions/configurations";
import classnames from "classnames";
import _ from "lodash";
import { NOTIFICATION_REFRESH_INTERVAL } from "../../../../config/globals";
import Select from "react-select";

class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group: null,
      queue: null,
      search: "",
      activeTab: "1",
      searchType: "group",
      searchElem: [],
      active: false,
      extensionList: [],
      extensions: null,
      allExtensions: false,
      is_oncall: false
    };
  }

  componentWillMount() {
    this.props.listQueues();
    this.props.list3cxGroups();
    this.props.loadAgentActivities();
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  generateReport() {
    const type = this.state.searchType;
    this.setState({ extensions: null, statuses: null }, () => {
      this.changeSearch();
    });

    let selectedIds = null;

    if (type === "group") {
      if (this.state.allExtensions) {
        // If "Select all Groups" is checked, get all group IDs
        selectedIds = this.props.groups_3cx.map((group) => group.id);
        this.setState({ searchElem: this.props.groups_3cx });

      } else if (!this.state.group) {
        alert("Please select a group");
        return;
      } else {
        selectedIds = this.state.group.map((group) => group.id);
        this.setState({ searchElem: this.state.group });
      }
    } else if (type === "queue") {

      if (this.state.allExtensions) {
        // If "Select all Queues" is checked, get all queue extensions
        selectedIds = this.props.queues.map((queue) => queue.extension);
        this.setState({ searchElem: this.props.queues });
      } else {
        if (!this.state.queue) {
          alert("Please select a Queue");
          return;
        }
        selectedIds = this.state.queue.map((queue) => queue.extension);
        this.setState({ searchElem: this.state.queue });

      }
    }

    if (!selectedIds) {
      return; // No valid selection found
    }
    this.setState({ searchedType: type, isLoading: true });

    // Get agent monitor data based on selected IDs
    if (type === "group") {
      this.props.getAgentMonitorData(selectedIds, () => {
        this.setState({ isLoading: false })
      });
    } else if (type === "queue") {
      this.props.getAgentMonitorDataByQueue(selectedIds, () => {
        this.setState({ isLoading: false })
      });
    }

    // Clear existing refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Set up the new refresh interval
    this.refreshInterval = setInterval(() => {
      if (type === "group") {
        this.props.getAgentMonitorData(selectedIds);
      } else if (type === "queue") {
        this.props.getAgentMonitorDataByQueue(selectedIds);
      }
    }, NOTIFICATION_REFRESH_INTERVAL * 1000);
  }

  changeSearch() {
    this.props.onSearchChange(this.state);
  }

  render() {
    const { agent_monitor_data } = this.props;

    return (
      <CardBody>
        <Row>
          <Col xs="12">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.searchType === "group",
                  })}
                  onClick={() => {
                    this.setState({
                      searchType: "group",
                    });
                  }}
                >
                  Group
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.searchType === "queue",
                  })}
                  onClick={() => {
                    this.setState({
                      searchType: "queue",
                    });
                  }}
                >
                  Queue
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.searchType}>
              <TabPane tabId="group">
                <Row>
                  <Col sm="12">
                    <FormGroup>
                      <Label htmlFor="name">Group</Label>
                      <Select
                        value={this.state.group}
                        options={this.props.groups_3cx}
                        onChange={(e) => this.setState({ group: e })}
                        isMulti={true}
                        getOptionValue={(option) => option["id"]}
                        getOptionLabel={(option) => option["name"]}
                        className="multi-select"
                        isDisabled={this.state.allExtensions}
                      />
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={this.state.allExtensions}
                            onChange={() =>
                              this.setState({
                                allExtensions: !this.state.allExtensions,
                              })
                            }
                          />
                          Select all Groups
                        </Label>
                      </FormGroup>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right">
                    <Button
                      onClick={() => this.generateReport()}
                      color="primary"
                      disabled={this.state.isLoading || !this.props.groups_3cx}
                    >
                      {this.state.isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Generate Report
                    </Button>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="queue">
                <Row>
                  <Col sm="12">
                    <FormGroup>
                      <Label htmlFor="name">Queue</Label>
                      <Select
                        value={this.state.queue}
                        options={this.props.queues}
                        onChange={(e) => this.setState({ queue: e })}
                        isMulti={true}
                        getOptionValue={(option) => option["extension"]}
                        getOptionLabel={(option) => option["display_name"]}
                        className="multi-select"
                        isDisabled={this.state.allExtensions}
                      />
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={this.state.allExtensions}
                            onChange={() =>
                              this.setState({
                                allExtensions: !this.state.allExtensions,
                              })
                            }
                          />
                          Select all Queues
                        </Label>
                      </FormGroup>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right">
                    <Button
                      onClick={() => this.generateReport("queue")}
                      color="primary"
                      disabled={this.state.isLoading}
                    >
                      {this.state.isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Generate Report
                    </Button>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </Col>
        </Row>
        {agent_monitor_data &&
          this.state.searchType === this.state.searchedType ? (
          <div>
            <hr />
            <h3>Filter</h3>
            <Row>
              <Col sm="12">
                <FormGroup>
                  <Label htmlFor="name">Extensions</Label>
                  <Select
                    value={this.state.extensions}
                    options={_.union(
                      ...this.state.searchElem.map((a) => a.extensions)
                    )}
                    onChange={(e) => this.setState({ extensions: e })}
                    isMulti
                    className="multi-select"
                    getOptionValue={(x) => x}
                    getOptionLabel={(x) => x}
                  />
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
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.is_oncall}
                      onChange={() =>
                        this.setState({ is_oncall: !this.state.is_oncall })
                      }
                    />
                    Agents on Call
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col className="text-right">
                <Button onClick={() => this.changeSearch()} color="primary">
                  Filter
                </Button>
              </Col>
            </Row>
          </div>
        ) : (
          ""
        )}
      </CardBody>
    );
  }
}

function mapStateToProps({
  groups_3cx,
  agent_monitor_data,
  agent_activities,
  queues,
}) {
  return {
    groups_3cx,
    agent_monitor_data,
    agent_activities,
    queues,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      list3cxGroups,
      getAgentMonitorData,
      loadAgentActivities,
      listQueues,
      getAgentMonitorDataByQueue,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);