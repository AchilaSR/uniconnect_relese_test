import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CardBody, Row, Col, FormGroup, Label, Button, Input } from "reactstrap";
import Select from "react-select";
import _ from "lodash";

import { loadCampaigns } from "../../../../actions/campaigns";

import Loader from "../../../../components/Loader";
import { getDialListSummary } from "../../../../actions/reports";
import ReportScheduleButton from "../../../../modules/report-automation/views/button";
import moment from "moment";
import DateTimeRangePicker from "../../../../components/DateTimeRangePicker";

class CampaignSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      campaigns: [],
      allCamapigns: false,
      duration_start: moment(),
      duration_end: moment(),
      scale: null,
      filterByLeadUpload: false,
      enableDateFilter: false
    };
  }

  componentWillMount() {
    this.props.loadCampaigns();
  }

  cancel() {
    this.setState({
      campaigns: [],
    });
  }

  getFilters() {
    const { campaigns } = this.state;

    if (this.state.allCamapigns) {
      return {
        campaign_ids: this.props.campaigns.map((a) => a.campign_id),
      };
    }

    if (!campaigns || !campaigns.length) {
      return null;
    }

    return {
      campaign_ids: campaigns.map((a) => a.campign_id),
    };
  }

  save() {
    const filters = this.getFilters();

    if (!filters) {
      alert("Please select the campaigns");
      return;
    }

    this.setState({ loading: true });
    this.props.getDialListSummary({
      "interval": this.state.scale && this.state.enableDateFilter ? this.state.scale.value : "",
      "filterByUpload": false,
      "ids": filters.campaign_ids,
      "startDate": this.state.enableDateFilter ? this.state.duration_start.format("YYYY-MM-DD HH:mm:ss"): null,
      "endDate": this.state.enableDateFilter ? this.state.duration_end.format("YYYY-MM-DD HH:mm:ss") : null
    }, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { campaigns } = this.props;

    if (!campaigns) {
      return <Loader />;
    }

    return (
      <CardBody>
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

                className="multi-select"
                isDisabled={this.state.allCamapigns}
              />
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={this.state.allCamapigns}
                    // disabled={(this.state.campaigns && this.state.campaigns.length !== 0)}
                    onChange={() =>
                      this.setState({
                        allCamapigns: !this.state.allCamapigns,
                      })
                    }
                  />
                  Select all Campaigns
                </Label>
              </FormGroup>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
          <FormGroup check style={{ paddingBottom: '10px' }}>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.enableDateFilter}
                      // disabled={(!this.state.campaigns || this.state.campaigns.length === 0) && !this.state.allCamapigns}
                      onChange={() =>
                        this.setState({
                          enableDateFilter: !this.state.enableDateFilter,
                        })
                      }
                    />
                    Enable Date Filter
                  </Label>
                </FormGroup>
          </Col>
        </Row>
        {this.state.enableDateFilter && <>
          <Row>
          <Col >
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
            </FormGroup></Col>
        </Row>

        {/* <Row>
          <Col>
          <FormGroup check style={{ paddingBottom: '10px' }}>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.filterByLeadUpload}
                      // disabled={(!this.state.campaigns || this.state.campaigns.length === 0) && !this.state.allCamapigns}
                      onChange={() =>
                        this.setState({
                          filterByLeadUpload: !this.state.filterByLeadUpload,
                        })
                      }
                    />
                    Filter By Lead Upload date
                  </Label>
                </FormGroup>
          </Col>
        </Row> */}
        </>
        }
        
        <Row>
          <Col>
            <ReportScheduleButton
              api={"GetDialListSummary"}
              data={this.getFilters()}
            />
          </Col>
          <Col className="text-right">
            <Button
              disabled={this.state.loading}
              onClick={() => this.save()}
              color="primary"
            >
              Generate Report
            </Button>{" "}
          </Col>
        </Row>
      </CardBody>
    );
  }
}

function mapStateToProps({ campaigns }) {
  return {
    campaigns,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadCampaigns,
      getDialListSummary,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignSummary);
