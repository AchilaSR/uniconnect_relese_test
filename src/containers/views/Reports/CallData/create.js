import React, { Component } from "react";
import { CardBody, Row, Col, FormGroup, Label, Button, Input, CustomInput, InputGroup, InputGroupAddon } from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getCallDataReport, loadAgents, stopBgProcess } from "../../../../actions/reports";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import moment from "moment";
import { listQueues, listExtensions, list3cxGroups } from "../../../../actions/configurations";
import Select from "react-select";
import _, { filter } from "lodash";
import ReportScheduleButton from "../../../../modules/report-automation/views/button";
import { LOCAL_PHONE_NUMBER_LENTGH } from "../../../../config/globals";
import { checkPermission, formatTimeToSeconds } from "../../../../config/util";
import Loader from "../../../../components/Loader";
import DateTimeRangePicker from "../../../../components/DateTimeRangePicker";
import { loadCampaigns } from "../../../../actions/campaigns";


class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      duration_start: moment(),
      duration_end: moment(),
      hour_range: {
        start: "00:00",
        end: "23:59",
      },
      selectAllQueues: false,
      agents: [],
      allAgents: false,
      selectAllGroups: false,
      loading: false,
      call_type: [],
      answer_state: [],
      phoneNumber: null,
      enableQueueSearch: false,
      enableAll: false,
      campaigns: [],
      hotline: null,
      allCamapigns: false,
      ignoreDateFilter: false,
      duration: "",
      duration_filter: ">="
    };
  }

  componentWillMount() {
    this.props.listQueues();
    this.props.loadAgents();
    this.props.list3cxGroups();
    this.props.loadCampaigns();
  }

  componentDidMount() {
    if (checkPermission("Call Logs Management", "WRITE")) {
      this.setState({ enableQueueSearch: true })
    }

    if (checkPermission("Call Logs Management", "editaccess")) {
      this.setState({ enableAll: true })
    }
  }

  reportData() {
    const allQueues = this.state.enableAll
      ? (this.props.queues || []).map(item => item.extension)
      : (this.props.queues || []).filter((a) => a.extensions.indexOf(this.props.user.user_details.extension) > -1).map(item => item.extension);

    const allExtensions = this.state.enableAll
      ? (this.props.agents || []).map(agent => agent.AgentExtension)
      : ([...this.props.queues, ...this.props.groups_3cx]).filter((a) => a.extensions.indexOf(this.props.user.user_details.extension) > -1).map(item => item.extensions).flat();

    // Filter queue extensions from this.state.queue
    let filteredQueues = this.state.queue != null && this.state.queue.length != 0 ? allQueues.filter(queue => {
      return this.state.queue.some(q => q.extension === queue);
    }) : [];

    let filteredExtensions = this.state.agents != null && this.state.agents.length != 0 ? allExtensions.filter(ext => {
      return this.state.agents.some(q => q.AgentExtension === ext);
    }) : [];

    if (this.state.group) {

      let uniqueExtensions = new Set();
      this.state.group.forEach(item => {
        item.extensions.forEach(extension => {
          uniqueExtensions.add(extension);
        });
      });
      uniqueExtensions = Array.from(uniqueExtensions);

      console.log(uniqueExtensions);

      if (filteredExtensions.length != 0) {
        const commonValues = filteredExtensions.filter(value => uniqueExtensions.includes(value));
        filteredExtensions = commonValues
      } else {
        filteredExtensions = uniqueExtensions
      }

      if (filteredExtensions.length == 0) {
        filteredExtensions = [0]
      }

    }

    let filterCampaignIds = []

    if (this.state.campaigns) {
      filterCampaignIds = this.state.campaigns.map((a) => String(a.campign_id))
    }


    if (this.state.allCamapigns) {
      filterCampaignIds = this.props.campaigns.map((a) => String(a.campign_id))
    }

    if (this.state.allAgents) {

      if (!this.state.group) {
        let tempfilteredExtensions = filteredExtensions

        filteredExtensions = this.props.agents.map(agent => agent.AgentExtension);

        if (tempfilteredExtensions.length != 0 && this.state.agents == null && this.state.agents.length == 0) {
          const commonValues = tempfilteredExtensions.filter(value => filteredExtensions.includes(value));
          filteredExtensions = commonValues
        }
      }


    }

    if (this.state.selectAllQueues) {
      let allExtensions = [];
      this.props.queues.forEach(item => {
        allExtensions.push(item.extension);
      });

      filteredQueues = allExtensions
    }

    if (this.state.selectAllGroups) {

      let tempfilteredExtensions = filteredExtensions
      let allExtensions = [];

      this.props.groups_3cx.forEach(item => {
        allExtensions = allExtensions.concat(item.extensions);
      });
      const uniqueExtensions = [...new Set(allExtensions)];
      filteredExtensions = uniqueExtensions



      filteredExtensions = this.props.agents.map(agent => agent.AgentExtension);

      if (tempfilteredExtensions.length != 0 && this.state.agents != null && this.state.agents.length != 0) {
        const commonValues = tempfilteredExtensions.filter(value => filteredExtensions.includes(value));
        filteredExtensions = commonValues
      }

    }

    const queueString = filteredQueues.length ? filteredQueues.join(" ") : null;
    const extensionString = filteredExtensions.length ? filteredExtensions.join(" ") : null;
    const campaignsIds = filterCampaignIds.length ? filterCampaignIds.join(" ") : null

    // const startDate = this.state.startDate.format("YYYY-MM-DD HH:MM:SS");
    // const endDate = this.state.endDate ? this.state.endDate.format("YYYY-MM-DD HH:MM:SS") : null;
    let startDate = this.state.duration_start.format("YYYY-MM-DD HH:mm:ss");
    let endDate = this.state.duration_end.format("YYYY-MM-DD HH:mm:ss");

    if (campaignsIds && campaignsIds.length && this.state.ignoreDateFilter) {
      startDate = null;
      endDate = null;
    }

    if (this.state.enableAll) {
      return {
        queue: queueString ? queueString : extensionString ? "" : null,
        startDate: startDate,
        endDate: endDate,
        extension: extensionString ? extensionString : queueString ? "" : null,
        number: (this.state.phoneNumber || "").substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
        campaign_id: campaignsIds,
        hotline: this.state.hotline ? this.state.hotline : null
      };
    }
    else if (this.state.enableQueueSearch) {
      return {
        queue: queueString ? queueString : extensionString ? "" : allQueues.join(" "),
        startDate: startDate,
        endDate: endDate,
        extension: extensionString ? extensionString : queueString ? "" : allExtensions.join(" "),
        number: (this.state.phoneNumber || "").substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
        campaign_id: this.state.campaigns ? this.state.campaigns.campign_id : null,
        hotline: this.state.hotline ? this.state.hotline : null
      };
    } else {
      return {
        queue: null,
        startDate: startDate,
        endDate: endDate,
        extension: this.props.user.user_details.extension,
        number: (this.state.phoneNumber || "").substr(-1 * LOCAL_PHONE_NUMBER_LENTGH),
        campaign_id: this.state.campaigns ? this.state.campaigns.campign_id : null,
        hotline: this.state.hotline ? this.state.hotline : null
      };
    }
  }


  generateReport() {

    const filters = this.reportData();
    this.setState({ loading: true });
    this.props.getCallDataReport(
      {
        queue: filters.queue || null,
        startDate: filters.startDate,
        endDate: filters.endDate,
        extension: filters.extension || null,
        number: filters.number || null,
        campaign_id: filters.campaign_id || null,
        hotline: filters.hotline || null
      },
      (loading) => {
        this.setState({ loading: loading });
      });

    this.filterReport();
  }

  checkFields() {
    if (this.state.selectAllQueues || (this.state.queue && this.state.queue.length > 0)) {
      return this.reportData();
    }
    return null;
  }

  changeCheckBox(key, value) {
    const i = this.state[key].indexOf(value);
    if (i > -1) {
      const v = this.state[key];
      v.splice(i, 1);
      this.setState({ [key]: v });
    } else {
      this.setState({ [key]: [value, ...this.state[key]] });
    }
  }

  filterReport() {
    this.props.onReportFilter({
      call_type: this.state.call_type,
      answer_state: this.state.answer_state.map((a) => a === "true"),
      duration_filter: this.state.duration_filter,
      duration: this.state.duration
    })
  }

  render() {
    if (!this.props.queues || !this.props.agents || !this.props.groups_3cx || !this.props.campaigns) {
      return <Loader />;
    }

    const allExtensions = this.state.enableAll
      ? (this.props.agents || []).map(agent => agent.AgentExtension)
      : ([...this.props.queues, ...this.props.groups_3cx]).filter((a) => a.extensions.indexOf(this.props.user.user_details.extension) > -1).map(item => item.extensions).flat();

    // console.log("extension", allExtensions)
    return (
      <CardBody>
        <Row>
          <Col xs="12">
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
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup >
              <Label htmlFor="name">Phone Number</Label>
              <Input type="text" id="name" placeholder="Enter the phone number" value={this.state.phoneNumber} onChange={(e) => this.setState({ phoneNumber: e.target.value })} />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup >
              <Label htmlFor="name">Hotline Number</Label>
              <Input type="text" id="name" placeholder="Enter the hotilne number" value={this.state.hotline} onChange={(e) => this.setState({ hotline: e.target.value })} />
            </FormGroup>
          </Col>
        </Row>
        {this.state.enableQueueSearch || this.state.enableAll ? <>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Queues</Label>
                <Select
                  value={this.state.queue}
                  options={this.state.enableAll ? this.props.queues : this.props.queues.filter((a) => a.extensions.indexOf(this.props.user.user_details.extension) > -1)}
                  onChange={e => this.setState({ queue: e })}
                  isMulti={true}
                  getOptionValue={option => option["extension"]}
                  getOptionLabel={option => option["display_name"]}
                  className="multi-select"
                  isClearable={true}
                  isDisabled={this.state.selectAllQueues}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.selectAllQueues}
                      // dissabled={ (this.state.agents && this.state.agents.length !=0 )}
                      onChange={() =>
                        this.setState({
                          selectAllQueues: !this.state.selectAllQueues,
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
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Groups</Label>
                <Select
                  value={this.state.group}
                  options={this.state.enableAll ? this.props.groups_3cx : this.props.groups_3cx.filter((a) => a.extensions.indexOf(this.props.user.user_details.extension) > -1)}
                  onChange={e => this.setState({ group: e })}
                  isMulti={true}
                  getOptionValue={option => option["id"]}
                  getOptionLabel={option => option["name"]}
                  className="multi-select"
                  isClearable={true}
                  isDisabled={this.state.selectAllGroups}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.selectAllGroups}
                      // disabled={ this.state.allAgents ||(this.state.agents && this.state.agents.length !=0 )
                      onChange={() =>
                        this.setState({
                          selectAllGroups: !this.state.selectAllGroups,
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
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Agents</Label>
                <Select
                  value={this.state.agents}
                  options={this.state.enableAll ? this.props.agents : this.props.agents.filter((a) => allExtensions.indexOf(a.AgentExtension) > -1)}
                  onChange={(e) => this.setState({ agents: e })}
                  isMulti={true}
                  getOptionValue={(option) => option["AgentExtension"]}
                  getOptionLabel={(option) => option["AgentName"]}
                  className="multi-select"
                  isDisabled={this.state.allAgents}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.allAgents}
                      // disabled={ (this.state.group && this.state.group.length !=0)}
                      onChange={() =>
                        this.setState({
                          allAgents: !this.state.allAgents,
                        })
                      }
                    />
                    Select all Agents
                  </Label>
                </FormGroup>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormGroup>
                <Label htmlFor="name">Campaigns</Label>
                <Select
                  value={this.state.campaigns}
                  options={this.props.campaigns}
                  onChange={(e) => this.setState({ campaigns: e })}
                  isMulti={true}
                  getOptionValue={(option) => option["campign_id"]}
                  getOptionLabel={(option) => `[${option["campign_id"]}] ${option["campaign_name"]}`}
                  isClearable={true}
                  className="multi-select"
                  isDisabled={this.state.allCamapigns || this.state.selectAllGroups}
                />
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.allCamapigns}
                      // disabled={ }
                      onChange={() =>
                        this.setState({
                          allCamapigns: !this.state.allCamapigns,
                        })
                      }
                    />
                    Select all Campaigns
                  </Label>
                </FormGroup>
                <FormGroup check style={{ paddingBottom: '10px' }}>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.ignoreDateFilter}
                      disabled={(!this.state.campaigns || this.state.campaigns.length === 0) && !this.state.allCamapigns}
                      onChange={() =>
                        this.setState({
                          ignoreDateFilter: !this.state.ignoreDateFilter,
                        })
                      }
                    />
                    Ignore date filters
                  </Label>
                </FormGroup>
              </FormGroup>
            </Col>
          </Row>

        </> : ""}
            <Row>
              <Col>
                <FormGroup>
                  <Label for="exampleCheckbox">Call Type</Label>
                  <div>
                    {
                      [
                        { value: "inbound", label: "Inbound" },
                        { value: "outbound", label: "Outbound" },
                        { value: "internal", label: "Internal" },
                        { value: "ringmymobile", label: "Ring My Mobile" },
                        { value: "conference", label: "Conference" }
                      ].map((a) => <CustomInput id={a.value} key={a.value} onChange={() => this.changeCheckBox("call_type", a.value)} checked={this.state.call_type.indexOf(a.value) > -1} type="checkbox" label={a.label} />)
                    }
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="exampleCheckbox">Call Status</Label>
                  <div>
                    {
                      [
                        { value: "true", label: "Answered" },
                        { value: "false", label: "Unanswered" }
                      ].map((a) => <CustomInput id={a.value} key={a.value} onChange={() => this.changeCheckBox("answer_state", a.value)} checked={this.state.answer_state.indexOf(a.value) > -1} type="checkbox" label={a.label} />)
                    }
                  </div>
                </FormGroup>
              </Col>
            </Row>
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
              <Col>
                <ReportScheduleButton
                  api={"getAbandondedCounts"}
                  data={this.checkFields()}
                />
              </Col>
              <Col xs={10} className="text-right">
                {this.state.loading ? <Button disabled={!this.props.background_process} onClick={() => this.props.stopBgProcess()} color="warning">
                  <i className='fa fa-spin fa-circle-o-notch'></i> Stop Generating
                </Button> : <Button onClick={() => this.generateReport()} color="primary">
                  Generate Report
                </Button>}


              </Col>
            </Row>
      </CardBody>
    );
  }
}

function mapStateToProps({ configurations, metadata, queues, extensions, agents, call_data, user, background_process, groups_3cx, campaigns }) {
  return {
    configurations,
    metadata,
    queues,
    extensions,
    agents,
    call_data,
    user,
    background_process,
    groups_3cx,
    campaigns
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getCallDataReport,
      listQueues,
      loadAgents,
      listExtensions,
      stopBgProcess,
      list3cxGroups,
      loadCampaigns
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateGroup);

