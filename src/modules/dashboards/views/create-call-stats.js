import React, { Component } from "react";
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { create } from "../action";
import Slider from "rc-slider";
import Select from "react-select";
import Loader from "../../../components/Loader";
import "react-dates/initialize";
import moment from "moment";
import { formatMSecondsToTime } from "../../../config/util";

const call_trend_options = [
  { value: "h", label: "Hourly" },
  { value: "d", label: "Daily" },
];

class CreateCallStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      type: "inbound",
      queue: [],
      agent_group: [],
      ivr: [],
      refresh_intval: 30,
      title: "",
      distribution: call_trend_options[0],
      max_extensions: 10,
      start_date: moment(),
      end_date: moment(),
      enableDateRange: false,
      exclude_interval: 0,
      selectAllQueues: false,
      selectAllGroups: false,
    };
  }

  save(e) {
    e.preventDefault();

    const { queue, type, agent_group, selectAllGroups, selectAllQueues } = this.state;

    if (selectAllQueues == false && queue.length === 0 && type == "login-stats") {
      alert("Please select a queue!");
      return;
    }

    if (selectAllGroups == false && agent_group.length == 0 && (type == "activity-monitor" || type == "activity-summary")) {
      alert("Please select an agent group!");
      return;
    }

    const data = this.prepareData();
    this.props.onSaved(data);
  }

  prepareData() {
    const { type, title, refresh_intval, enableDateRange } = this.state;
    const data = {
      refresh_interval_seconds: refresh_intval * 1000,
      id: Date.now() % 1000000,
      type,
      title,
      date_range: null,
    };

    if (enableDateRange) {
      data.date_range = {
        start: this.state.start_date.format("YYYY-MM-DD 00:00:00"),
        end: this.state.end_date.format("YYYY-MM-DD 23:59:59"),
      };
    }

    switch (type) {
      case "inbound":
        this.prepareInboundData(data);
        break;
      case "ivr":
        this.prepareIvrData(data);
        break;
      case "outbound":
        this.prepareOutboundData(data);
        break;
      case "trend":
        this.prepareTrendData(data);
        break;
      case "login-stats":
        this.prepareLoginStatsData(data);
        break;
      case "distribution":
      case "distribution-chart":
        this.prepareDistributionData(data);
        break;
      case "activity-monitor":
        this.prepareActivityMonitorData(data);
        break;
      case "activity-summary":
        this.prepareActivitySummaryData(data);
        break;
    }

    return data;
  }

  prepareInboundData(data) {
    const { selectAllQueues, queue, exclude_interval, enableBuzzer, min_customers_waiting, min_queue_wait } = this.state;
    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.map(queue => queue.extension);
    data.exclude_interval = formatMSecondsToTime(exclude_interval * 1000);
    data.enableBuzzer = enableBuzzer;
    data.min_customers_waiting = min_customers_waiting;
    data.min_queue_wait = min_queue_wait;
    data.position = { x: 0, y: 1000, w: 2, h: 24 };
  }

  prepareIvrData(data) {
    data.ivrs_in_monitor = this.state.ivr.map(a => a.extension);
    data.position = { x: 0, y: 1000, w: 2, h: 12 };
  }
  prepareOutboundData(data) {
    const { selectAllGroups, agent_group } = this.state;
    data.groups_in_monitor = selectAllGroups
      ? []
      : agent_group.map(group => group.id);
    data.position = { x: 0, y: 1000, w: 2, h: 12 };
  }

  prepareTrendData(data) {
    const { selectAllGroups, selectAllQueues, agent_group, queue, distribution, max_extensions } = this.state;
    data.groups_in_monitor = selectAllGroups
      ? []
      : agent_group.map(group => group.id);

    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.map(queue => queue.extension);
    data.distribution = distribution.value;
    data.max_extensions = max_extensions;
    data.position = { x: 0, y: 1000, w: 4, h: 36 };
  }

  prepareLoginStatsData(data) {
    const { selectAllQueues, queue } = this.state;

    // if (queue.length == 0) {
    //   alert("Please select a queue!");
    //   return;
    // }
    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.map(queue => queue.extension);
    data.position = { x: 0, y: 1000, w: 2, h: 24 };
  }

  prepareDistributionData(data) {
    const { selectAllGroups, selectAllQueues, agent_group, queue, exclude_interval } = this.state;
    data.groups_in_monitor = selectAllGroups
      ? []
      : agent_group.map(group => group.id);
    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.map(queue => queue.extension);
    data.exclude_interval = formatMSecondsToTime(exclude_interval * 1000);
    data.position = { x: 0, y: 1000, w: 2, h: 35 };
  }

  prepareActivityMonitorData(data) {
    const { selectAllGroups, selectAllQueues, agent_group, queue } = this.state;

    data.groups_in_monitor = selectAllGroups
      ? []
      : agent_group.length ? agent_group.map(group => group.id) : undefined;
    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.length ? queue.map(queue => queue.extension) : undefined;
    data.position = { x: 0, y: 1000, w: 2, h: 24 };
  }

  prepareActivitySummaryData(data) {
    const { selectAllGroups, selectAllQueues, agent_group, queue } = this.state;
    data.groups_in_monitor = selectAllGroups
      ? []
      : agent_group.length ? agent_group.map(group => group.id) : undefined;
    data.queues_in_monitor = selectAllQueues
      ? []
      : queue.length ? queue.map(queue => queue.extension) : undefined;
    data.position = { x: 0, y: 1000, w: 3, h: 15 };
  }

  clearForm() {
    this.setState({ message: "" });
    this.props.onCanceled();
  }

  render() {
    const { queues, ivrs, agent_groups } = this.props;

    if (!queues || !ivrs || !agent_groups) {
      return <Loader />;
    }

    return (
      <form onSubmit={(e) => this.save(e)}>
        <div className="d-flex">
          <div className="widget-button-container">
            {
              [
                { type: "inbound", label: "Inbound Call Statistics" },
                { type: "outbound", label: "Outbound Call Statistics" },
                { type: "ivr", label: "IVR Call Statistics" },
                { type: "trend", label: "Extension Statistics" },
                { type: "distribution", label: "Call Distribution" },
                { type: "distribution-chart", label: "Call Distribution Chart" },
                { type: "login-stats", label: "Queue Login Statistics" },
                { type: "activity-monitor", label: "Agent Activity Monitor" },
                { type: "activity-summary", label: "Agent Activity Summary" },
              ].map(({ type, label }) => (<Button
                type="button"
                outline={this.state.type !== type}
                onClick={() => {this.setState({ type }), this.setState({ title: "" })}}
                color="primary"
              >
                {label}
              </Button>))
            }
          </div>
          <div className="flex-grow-1">
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label htmlFor="name">Title</Label>
                  <Input
                    placeholder="Enter a title for the widget"
                    value={this.state.title}
                    onChange={(e) => this.setState({ title: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            {this.state.type === "trend" ? (
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name">Distribution</Label>
                    <Select
                      value={this.state.distribution}
                      options={call_trend_options}
                      onChange={(e) => this.setState({ distribution: e })}
                      isMulti={false}
                      className="multi-select"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name">Number of Records</Label>
                    <Input
                      value={this.state.max_extensions}
                      placeholder="Number of Records"
                      type="number"
                      min={1}
                      max={100}
                      onChange={(e) =>
                        this.setState({ max_extensions: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
            ) : (
              ""
            )}
            <Row>
              {this.state.type !== "outbound" && this.state.type !== "ivr" ? (
                <Col md="12">
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
                      //disable selection when checked select all queues
                      isDisabled={this.state.selectAllQueues}
                    />
                    {/* {true && (
                      <div className="error-message">Please select at least one queue.</div>
                    )} */}
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={this.state.selectAllQueues}
                          onChange={() =>
                            this.setState({
                              selectAllQueues: !this.state.selectAllQueues,
                              // Clear the selected queues when "Select all Queues" is checked
                              queue: [],
                            })
                          }
                        />
                        Select all Queues
                      </Label>
                    </FormGroup>
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
              {this.state.type === "ivr" ? (
                <Col md="12">
                  <FormGroup>
                    <Label htmlFor="name">IVR</Label>
                    <Select
                      value={this.state.ivr}
                      options={this.props.ivrs}
                      onChange={(e) => this.setState({ ivr: e })}
                      isMulti={true}
                      getOptionValue={(option) => option["extension"]}
                      getOptionLabel={(option) => option["ivr_name"]}
                      className="multi-select"
                      isClearable={true}
                    />
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
              {["outbound", "trend", "distribution", "distribution-chart", "activity-monitor", "activity-summary"].indexOf(
                this.state.type
              ) > -1 ? (
                <Col md="12">
                  <FormGroup>
                    <Label htmlFor="name">Agent Group</Label>
                    <Select
                      value={this.state.agent_group}
                      options={this.props.agent_groups}
                      onChange={(e) => this.setState({ agent_group: e })}
                      isMulti={true}
                      getOptionValue={(option) => option["id"]}
                      getOptionLabel={(option) => option["name"]}
                      className="multi-select"
                      isClearable={true}
                      //disable selection when checked select all queues
                      isDisabled={this.state.selectAllGroups}
                    />
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={this.state.selectAllGroups}
                          onChange={() =>
                            this.setState({
                              selectAllGroups: !this.state.selectAllGroups,
                              // Clear the selected groups when "Select all Groups" is checked
                              agent_group: [],
                            })
                          }
                        />
                        Select all Groups
                      </Label>
                    </FormGroup>
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
              {["inbound", "distribution", "distribution-chart"].indexOf(this.state.type) > -1 ? (
                <Col>
                  <FormGroup>
                    <Label htmlFor="name">Drop Call Interval (Sec)</Label>
                    <Input
                      value={this.state.exclude_interval}
                      placeholder="Dropped calls shorter than to exclude"
                      type="number"
                      min={0}
                      max={300}
                      onChange={(e) =>
                        this.setState({ exclude_interval: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
              ) : (
                ""
              )}
            </Row>
            {
              this.state.type === "inbound" ? <div className="bg-light rounded px-3 pt-3 mb-3">
                <FormGroup check className="pb-3">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.enableBuzzer}
                      onChange={() =>
                        this.setState({
                          enableBuzzer: !this.state.enableBuzzer,
                        })
                      }
                    />
                    Enable Buzzer
                  </Label>
                </FormGroup>
                {this.state.enableBuzzer ? <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="name">Minimum Queue Wait Interval (Sec)</Label>
                      <Input
                        value={this.state.min_queue_wait}
                        placeholder="Minimum Queue Wait Interval"
                        type="number"
                        min={0}
                        max={300}
                        onChange={(e) =>
                          this.setState({ min_queue_wait: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="name">Minimum Customers in Queue</Label>
                      <Input
                        value={this.state.min_customers_waiting}
                        placeholder="Minumum number of customers wating in queue"
                        type="number"
                        min={0}
                        max={300}
                        onChange={(e) =>
                          this.setState({ min_customers_waiting: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row> : ""}
              </div> : ""
            }
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label htmlFor="name">Refresh Interval</Label>
                  <div className="border rounded px-3 py-2 pb-4">
                    <Slider
                      min={5}
                      max={300}
                      step={5}
                      value={this.state.refresh_intval}
                      onChange={(e) => this.setState({ refresh_intval: e })}
                      marks={{
                        5: "5s",
                        15: "15s",
                        30: "30s",
                        60: "1m",
                        120: "2m",
                        180: "3m",
                        300: "5m",
                      }}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="text-right">
                <Button type="submit" color="primary">
                  Add
                </Button>{" "}
                <Button onClick={() => this.clearForm()} color="danger">
                  Cancel
                </Button>
              </Col>
            </Row>
          </div>
        </div >
      </form >
    );
  }
}

function mapStateToProps({ queues, ivrs, groups_3cx }) {
  return {
    queues,
    ivrs,
    agent_groups: groups_3cx,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      create,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCallStats);
