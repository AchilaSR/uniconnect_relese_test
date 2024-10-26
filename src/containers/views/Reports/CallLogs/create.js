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
  CustomInput,
  Input,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { loadAgents, loadCallLogs } from "../../../../actions/reports";
import { listQueues } from "../../../../actions/configurations";
import _ from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import moment from "moment";
import { checkPermission } from "../../../../config/util";
import call_types from "../../../../config/call_types";
import classnames from "classnames";
import { CALL_LOGS_BACKDATE_RANGE, CALL_LOGS_DATE_RANGE } from "../../../../config/globals";
import { formatTimeToSeconds } from "../../../../config/util";
import ReportScheduleButton from "../../../../modules/report-automation/views/button";

class AgentActivityRptCreate extends Component {
  constructor(props) {
    super(props);

    const start = moment();
    const remainder = 30 - (start.minute() % 30);

    this.state = {
      searchType: "date",
      starttime: moment().startOf('day').toDate(),
      //starttime: moment().subtract(CALL_LOGS_DATE_RANGE.value, CALL_LOGS_DATE_RANGE.units).startOf("day").toDate(),
      endtime: moment().add(remainder, "minutes").set({ seconds: 0 }).toDate(),
      loading: false,
      filters: [],
      filtered_logs: [],
      extension: "",
      _extension: "",
      queue: "",
      phone: "",
      ivrExtension: "",
      _ivrExtension: "",
      showExtensions: false,
      showPhone: false,
      showQueues: false,
      showOthers: false,
      showIvrExtension: false,
      showAll: true,
      answered: true,
      unanswered: true,
      search: "",
      duration: 0,
      duration_filter: ">="
    };
  }

  componentWillMount() {
    this.props.loadAgents();
    this.props.listQueues();

    if (!checkPermission("Call Logs Management", "WRITE")) {
      const { extension, extension_id } = this.props.user.user_details;
      this.setState({
        _ivrExtension: extension,
        ivrExtension: extension,
        _extension: [{ id: extension_id, extension }],
        extension: [{ id: extension_id, extension }],
      });
    }
  }

  componentDidMount() {
    // this.generateReport();
  }

  generateReport() {
    const self = this;

    self.setState(
      {
        loading: true,
        filters: [call_types[0]],
        searchedType: this.state.searchType
      },
      self.props.loadCallLogs(
        {
          searchType: this.state.searchType,
          phone: [this.state.phone],
          starttime: this.state.starttime,
          endtime: this.state.endtime,
        },
        (loading) => {
          self.setState(
            {
              loading,
            },
            () => this.filterReport()
          );
        }
      )
    );
  }

  showFilterOptions() {
    return Promise.all([
      ...[
        ["showExtensions", "extension", this.state._extension],
        ["showQueues", "queue", ""],
        ["showIvrExtension", "ivrExtension", this.state._ivrExtension],
        ["showPhone", "phone", ""],
      ].map(
        (a) =>
          new Promise((resolve) => {
            if (
              this.state.filters.length > 0 &&
              !_.find(this.state.filters, { [a[0]]: false })
            ) {
              if (!this.state[a[0]]) {
                this.setState({ [a[0]]: true, [a[1]]: a[2] }, () => {
                  resolve();
                });
              } else {
                resolve();
              }
            } else {
              this.setState({ [a[1]]: "", [a[0]]: false }, () => {
                resolve();
              });
            }
          })
      ),
      new Promise((resolve) => {
        if (!this.state.showAll) {
          this.setState({ search: "" }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      }),
    ]);
  }

  filterReport() {
    const { call_logs } = this.props;
    let filtered_logs = [];
    const other_logs = [];
    this.showFilterOptions().then(() => {
      if (
        (this.state.filters.length === 0 && !this.state.showOthers) ||
        this.state.showAll
      ) {
        filtered_logs = call_logs;
      } else {
        call_logs.map((call) => {
          this.state.filters.map((filter_type) => {
            if (filter_type.filter) {
              filter_type.filter.map((filter) => {
                let res = true;

                const src = call.source_caller_id.replace(/\D/g, "");
                const dst = call.destination_caller_id.replace(/\D/g, "");

                if (
                  typeof filter.source !== "undefined" &&
                  call.source_type !== filter.source
                ) {
                  res = false;
                } else if (
                  typeof filter.destination !== "undefined" &&
                  call.destination_type !== filter.destination
                ) {
                  res = false;
                }

                if (
                  this.state.extension &&
                  _.filter(this.state.extension, { AgentExtension: src }).length +
                  _.filter(this.state.extension, { AgentExtension: dst })
                    .length ===
                  0
                ) {
                  res = false;
                }

                if (
                  this.state.queue &&
                  _.filter(this.state.queue, { extension: src }).length +
                  _.filter(this.state.queue, { extension: dst }).length ===
                  0
                ) {
                  res = false;
                }

                if (
                  this.state.phone &&
                  !(
                    call.source_caller_id.indexOf(this.state.phone) > -1 ||
                    call.destination_caller_id.indexOf(this.state.phone) > -1
                  )
                ) {
                  res = false;
                }

                if (
                  this.state.ivrExtension &&
                  !(
                    call.destination_caller_id.indexOf(
                      this.state.ivrExtension
                    ) > -1
                  )
                ) {
                  res = false;
                }

                if (res) {
                  filtered_logs.push(call);
                }
                return null;
              });
            } else {
              filtered_logs.push(call);
            }
            return null;
          });
          return null;
        });

        if (this.state.showOthers) {
          call_logs.map((call) => {
            call_types.map((filter_type) => {
              if (filter_type.filter) {
                filter_type.filter.map((filter) => {
                  let res = true;
                  if (
                    typeof filter.source !== "undefined" &&
                    call.source_type !== filter.source
                  ) {
                    res = false;
                  } else if (
                    typeof filter.destination !== "undefined" &&
                    call.destination_type !== filter.destination
                  ) {
                    res = false;
                  }

                  if (res) {
                    other_logs.push(call);
                  }
                  return null;
                });
              } else {
                other_logs.push(call);
              }
              return null;
            });
            return null;
          });

          const diff = _.difference(call_logs, other_logs);
          filtered_logs = [...filtered_logs, ...diff];
        }

        filtered_logs = _.uniqBy(filtered_logs, "id");
      }

      if (this.state.answered !== this.state.unanswered) {
        filtered_logs = _.filter(filtered_logs, {
          answered: this.state.answered,
        });
      }

      if (this.state.search) {
        filtered_logs = _.filter(filtered_logs, (a) => {
          return Object.values(a).some((item) => {
            return item.toString().indexOf(this.state.search) > -1;
          });
        });
      }

      if (this.state.duration) {
        filtered_logs = _.filter(filtered_logs, (a) => {
          return a.talking_duration && eval(`${formatTimeToSeconds(a.talking_duration)} ${this.state.duration_filter} ${this.state.duration} `)
        });
      }

      this.setState({ filtered_logs }, () => {
        if (this.props.onFiltered) {
          this.props.onFiltered(this.state.filtered_logs);
        }
      });
    });
  }

  changeFilters(type) {
    const index = this.state.filters.indexOf(type);
    if (index > -1) {
      this.state.filters.splice(index, 1);
      this.setState({ filters: [...this.state.filters] }, () =>
        this.filterReport()
      );
    } else {
      this.setState({ filters: [...this.state.filters, type] }, () =>
        this.filterReport()
      );
    }
  }

  render() {
    const { call_logs, agents } = this.props;
    const { searchType, searchedType } = this.state;

    return (
      <Card className="mr-3" style={{ flexShrink: 0, width: 300 }}>
        <CardHeader>Report Settings</CardHeader>
        <CardBody className="scrollable-card">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({
                  active: this.state.searchType === "date",
                })}
                onClick={() => {
                  this.setState({ searchType: "date" });
                }}
              >
                Date Range
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({
                  active: this.state.searchType === "phone",
                })}
                onClick={() => {
                  this.setState({ searchType: "phone" });
                }}
              >
                Phone Number
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.searchType}>
            <TabPane tabId="date">
              <div>
                <Row>
                  <Col>
                    <FormGroup>
                      <Label htmlFor="ccnumber">Start Date and Time</Label>
                      <DatePicker
                        selected={this.state.starttime}
                        onChange={(starttime) =>
                          this.setState({
                            starttime,
                            endtime:
                              moment(this.state.endtime).diff(
                                starttime,
                                CALL_LOGS_DATE_RANGE.units
                              ) > CALL_LOGS_DATE_RANGE.value
                                ? moment(starttime).add(CALL_LOGS_DATE_RANGE.value, CALL_LOGS_DATE_RANGE.units).toDate()
                                : moment(this.state.endtime).diff(
                                  starttime,
                                  "m"
                                ) < 30
                                  ? moment(starttime).add(30, "m").toDate()
                                  : this.state.endtime,
                          })
                        }
                        showTimeSelect
                        minDate={moment().subtract(CALL_LOGS_BACKDATE_RANGE.value, CALL_LOGS_BACKDATE_RANGE.units).toDate()}
                        maxDate={new Date()}
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <Label htmlFor="ccnumber">End Date and Time</Label>
                      <DatePicker
                        selected={this.state.endtime}
                        // onChange={(endtime) => this.setState({ endtime })}
                        onChange={(endtime) =>
                          this.setState({
                            endtime,
                            starttime:
                              moment(endtime).diff(
                                this.state.starttime,
                                CALL_LOGS_DATE_RANGE.units
                              ) > CALL_LOGS_DATE_RANGE.value
                                ? moment(endtime).subtract(CALL_LOGS_DATE_RANGE.value, CALL_LOGS_DATE_RANGE.units).toDate()
                                : moment(endtime).diff(
                                  this.state.starttime,
                                  "m"
                                ) < 30
                                  ? moment(endtime).subtract(30, "m").toDate()
                                  : this.state.starttime,
                          })
                        }
                        showTimeSelect
                        minDate={this.state.starttime}
                        maxDate={new Date()}
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <ReportScheduleButton api={"getCallLog"} data={{
                      starttime: this.state.starttime,
                      endtime: this.state.endtime
                    }} />
                  </Col>
                  <Col className="text-right">
                    <Button
                      disabled={this.state.loading}
                      onClick={() => this.generateReport()}
                      color="primary"
                    >
                      {this.state.loading && (
                        <i className="fa fa-spin fa-circle-o-notch " />
                      )}{" "}
                      Search
                    </Button>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tabId="phone">
              <div>
                <Row>
                  <Col xs="12">
                    <FormGroup>
                      <Label htmlFor="name">Phone Number</Label>
                      <Input
                        value={this.state.phone}
                        onChange={(e) =>
                          this.setState({ phone: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right">
                    <Button
                      onClick={() => this.generateReport()}
                      color="primary"
                      disabled={!this.state.phone}
                    >
                      {this.state.loading && (
                        <i className="fa fa-spin fa-circle-o-notch " />
                      )}{" "}
                      Search
                    </Button>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </TabContent>

          {searchType === searchedType && call_logs && call_logs.length > 0 ? (
            <div>
              <br />
              <Row>
                <Col>
                  {!this.state.answered &&
                    this.state.unanswered &&
                    this.state.filters.length === 1 &&
                    this.state.filters[0].label === "Queues" ? (
                    <Alert color="info">
                      <b>{this.state.filtered_logs.length}</b> calls abandoned
                      of <b>{call_logs.length}</b> filtered
                    </Alert>
                  ) : (
                    <Alert color="info">
                      <b>{this.state.filtered_logs.length}</b> calls out of{" "}
                      <b>{call_logs.length}</b> filtered
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Label for="exampleCheckbox">Filter</Label>
                    <div>
                      <CustomInput
                        id="othallers"
                        onChange={() =>
                          this.setState({ showAll: !this.state.showAll }, () =>
                            this.filterReport()
                          )
                        }
                        checked={this.state.showAll}
                        type="checkbox"
                        label="All"
                      />
                      {call_types.map((type) => (
                        <CustomInput
                          disabled={this.state.showAll}
                          id={type.label}
                          key={type.label}
                          onChange={() => this.changeFilters(type)}
                          checked={_.find(this.state.filters, {
                            label: type.label,
                          })}
                          type="checkbox"
                          label={type.label}
                        />
                      ))}
                      <CustomInput
                        id="others"
                        disabled={this.state.showAll}
                        onChange={() =>
                          this.setState(
                            { showOthers: !this.state.showOthers },
                            () => this.filterReport()
                          )
                        }
                        checked={this.state.showOthers}
                        type="checkbox"
                        label="Others"
                      />
                      <hr />
                      <CustomInput
                        id="answered"
                        onChange={() =>
                          this.setState(
                            { answered: !this.state.answered },
                            () => this.filterReport()
                          )
                        }
                        checked={this.state.answered}
                        type="checkbox"
                        label="Answered"
                      />
                      <CustomInput
                        id="unanswered"
                        onChange={() =>
                          this.setState(
                            { unanswered: !this.state.unanswered },
                            () => this.filterReport()
                          )
                        }
                        checked={this.state.unanswered}
                        type="checkbox"
                        label="Unanswered"
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              {!this.state.showAll && !this.state.showOthers ? (
                <div>
                  {this.state.showExtensions ? (
                    <Row>
                      <Col xs="12">
                        <FormGroup>
                          <Label htmlFor="name">Agents</Label>
                          <Select
                            value={this.state.extension}
                            options={agents}
                            onChange={(e) => this.setState({ extension: e })}
                            isMulti={true}
                            getOptionValue={(option) => option["AgentExtension"]}
                            getOptionLabel={(option) => option["AgentName"]}
                            className="multi-select"
                            isClearable={true}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                  {this.state.showQueues ? (
                    <Row>
                      <Col xs="12">
                        <FormGroup>
                          <Label htmlFor="name">Queues</Label>
                          <Select
                            value={this.state.queue}
                            options={this.props.queues}
                            onChange={(e) => this.setState({ queue: e })}
                            isMulti={true}
                            getOptionValue={(option) => option["extension"]}
                            getOptionLabel={(option) => option["display_name"]}
                            className="multi-select"
                            isClearable={true}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                  {this.state.showPhone ? (
                    <Row>
                      <Col xs="12">
                        <FormGroup>
                          <Label htmlFor="name">Phone Number</Label>
                          <Input
                            value={this.state.phone}
                            onChange={(e) =>
                              this.setState({ phone: e.target.value })
                            }
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                  {this.state.showIvrExtension ? (
                    <Row>
                      <Col xs="12">
                        <FormGroup>
                          <Label htmlFor="name">IVR Extension</Label>
                          <Input
                            value={this.state.ivrExtension}
                            onChange={(e) =>
                              this.setState({ ivrExtension: e.target.value })
                            }
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
              {this.state.showAll ? (
                <Row>
                  <Col xs="12">
                    <FormGroup>
                      <Label htmlFor="name">Search</Label>
                      <Input
                        value={this.state.search}
                        onChange={(e) =>
                          this.setState({ search: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
              ) : (
                ""
              )}
              <Row>
                <Col xs="12">
                  <FormGroup>
                    <Label htmlFor="name">Call Duration</Label>
                    <InputGroup>
                      <Input value={this.state.duration_filter} onChange={(e) =>
                        this.setState({ duration_filter: e.target.value })
                      } type="select" name="select">
                        <option value={">="}>More than</option>
                        <option value={"<="}>Less than</option>
                      </Input>
                      <Input
                        value={this.state.duration}
                        type="number"
                        min={0}
                        onChange={(e) =>
                          this.setState({ duration: e.target.value })
                        }
                      />
                      <InputGroupAddon addonType="append">Seconds</InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col className="text-right">
                  <Button onClick={() => this.filterReport()} color="primary">
                    Filter
                  </Button>
                </Col>
              </Row>
            </div>
          ) : (
            ""
          )}
        </CardBody>
      </Card>
    );
  }
}

function mapStateToProps({ agents, call_logs, queues, user }) {
  return {
    agents,
    call_logs,
    queues,
    user,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadAgents,
      loadCallLogs,
      listQueues,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AgentActivityRptCreate);
