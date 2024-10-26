import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import "react-dates/initialize";
import ReactDatePicker from 'react-datepicker';
import Select from "react-select";
import moment from "moment";
import _ from "lodash";

import { getOutboundReport, loadAgents } from "../../../../actions/reports.js";
import Loader from "../../../../components/Loader";
import { list3cxGroups } from "../../../../actions/configurations.js";
import ReportScheduleButton from "../../../../modules/report-automation/views/button";

class DialerReports extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: new Date(),
      agents: [],
      scale: { value: 'day', label: 'Daily' },
      allAgents: false,
    };
  }

  componentWillMount() {
    this.props.loadAgents();
    this.props.list3cxGroups();
  }

  cancel() {
    this.setState({
      date: new Date(),
      agents: [],
      allAgents: false,
    });
  }

  getFilters() {
    const { date, agents, allAgents, group, scale } = this.state;

    let filteredAgents = agents;

    if (allAgents) {
      filteredAgents = this.props.agents;
    }

    filteredAgents = _.map(filteredAgents, "AgentExtension");

    if (group) {
      filteredAgents = group.extensions;
    }

    if (!date || filteredAgents.length === 0) {
      return;
    }

    const scale_limits = {
      'hour': 'day',
      'day': 'month',
      'month': 'y'
    }

    return {
      duration: {
        start_time: moment(date).startOf(scale_limits[scale.value]).format("YYYY-MM-DD 00:00:00"),
        end_time: moment(date).endOf(scale_limits[scale.value]).format("YYYY-MM-DD 23:59:59"),
      },
      agent_extension: filteredAgents,
      scale: scale.value
    };
  }

  save() {
    const filters = this.getFilters();

    if (!filters) {
      alert("Please fill all the fields");
      return;
    }

    this.setState({ loading: true });
    this.props.getOutboundReport(filters, () => {
      //this.cancel();
      this.setState({ loading: false });
    });
  }
  render() {
    const { agents } = this.props;

    if (!agents) {
      return <Loader />;
    }

    return (
      <CardBody>
        <Row>
          <Col>
            <FormGroup>
              <Label>Interval</Label>
              <Select
                value={this.state.scale}
                options={[
                  { value: 'hour', label: 'Hourly' },
                  { value: 'day', label: 'Daily' },
                  { value: 'month', label: 'Monthly' }
                ]}
                onChange={(e) => this.setState({ scale: e })}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label>{this.state.scale.value === 'month' ? "Year" : this.state.scale.value === 'day' ? "Month" : "Date"}</Label>
              <ReactDatePicker
                value={this.state.date}
                selected={this.state.date}
                onChange={(e) => this.setState({ date: e })}
                maxDate={new Date()}
                dateFormat={this.state.scale.value === 'month' ? "yyyy" : this.state.scale.value === 'day' ? "yyyy-MM" : "yyyy-MM-dd"}
                className="form-control"
                showMonthYearPicker={this.state.scale.value === 'day'}
                showYearPicker={this.state.scale.value === 'month'}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label htmlFor="name">Group</Label>
              <Select
                value={this.state.group}
                options={this.props.groups_3cx}
                onChange={(e) => this.setState({ group: e })}
                className="multi-select"
                getOptionValue={(option) => option["id"]}
                getOptionLabel={(option) => option["name"]}
                isClearable={true}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Label htmlFor="name">Agents</Label>
              <Select
                value={this.state.agents}
                options={this.props.agents}
                onChange={(e) => this.setState({ agents: e })}
                isMulti={true}
                getOptionValue={(option) => option["AgentExtension"]}
                getOptionLabel={(option) => option["AgentName"]}
                className="multi-select"
                isDisabled={this.state.allAgents || this.state.group}
              />
              <FormGroup check>
                <Label check>
                  <Input
                    disabled={this.state.group}
                    checked={this.state.allAgents}
                    onChange={() =>
                      this.setState({ allAgents: !this.state.allAgents })
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
          <Col xs="2">
            <ReportScheduleButton
              api={"getAgentOutboundData"}
              data={this.getFilters()}
            />
          </Col>
          <Col xs="10" className="text-right">
            <Button disabled={this.state.loading} onClick={() => this.save()} color="primary">
              {this.state.loading ? <i className="fa fa-spin fa-circle-o-notch"></i> : ""} Generate Report
            </Button>{" "}
          </Col>
        </Row>
      </CardBody>
    );
  }
}

function mapStateToProps({ agents, groups_3cx }) {
  return {
    agents,
    groups_3cx,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadAgents,
      getOutboundReport,
      list3cxGroups,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DialerReports);
