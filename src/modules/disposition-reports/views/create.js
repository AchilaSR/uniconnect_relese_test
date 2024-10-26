import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CardBody, Row, Col, FormGroup, Label, Button } from "reactstrap";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import Select from "react-select";
import _ from "lodash";

import { loadCampaigns } from "../../../actions/campaigns";
import { getReport } from "../action";
import Loader from "../../../components/Loader";
import ReportScheduleButton from "../../../modules/report-automation/views/button";

class DialerReports extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addedon_min: null,
      addedon_max: null,
      campaigns: null,
    };
  }

  componentWillMount() {
    this.props.loadCampaigns();
  }

  getFilters() {
    const { campaigns, addedon_min, addedon_max } = this.state;

    // Check if at least one filter is selected
    if (!campaigns && !addedon_min) {
      return null;
    }

    const filters = { campaign_id_list: [null] };

    if (campaigns) {
      filters.campaign_id_list = [campaigns.campign_id];
    }

    if (addedon_min) {
      filters.addedon_min = addedon_min.format("YYYY-MM-DD 00:00:00");

      // Check if addedon_max is not null before accessing its value
      if (addedon_max) {
        filters.addedon_max = addedon_max.format("YYYY-MM-DD 23:59:59");
      }
    }

    return filters;
  }

  save() {
    const filters = this.getFilters();

    if (!filters) {
      alert("Please select at least one filter.");
      return;
    }

    this.props.getReport(filters);
    // this.cancel();
  }

  cancel() {
    this.setState({
      addedon_min: null,
      addedon_max: null,
      campaigns: null,
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
              <Label htmlFor="ccnumber">Date</Label>
              <DateRangePicker
                startDate={this.state.addedon_min}
                minimumNights={0}
                startDateId="dd_startDate"
                endDate={this.state.addedon_max}
                endDateId="dd_endDate"
                onDatesChange={({ startDate, endDate }) =>
                  this.setState({
                    addedon_min: startDate,
                    addedon_max: endDate,
                  })
                }
                focusedInput={this.state.dd_focusedInput}
                onFocusChange={(dd_focusedInput) =>
                  this.setState({ dd_focusedInput })
                }
                orientation={this.state.orientation}
                openDirection={this.state.openDirection}
                disabled={false}
                isOutsideRange={() => false}
              />
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
                isMulti={false}
                getOptionValue={(option) => option["campign_id"]}
                getOptionLabel={(option) => `[${option["campign_id"]}] ${option["campaign_name"]}`}
                className="multi-select"
                isDisabled={this.state.allCampaigns}
                isClearable={true}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm="2">
            <ReportScheduleButton
              api={"getDispositionReportData"}
              data={this.getFilters()}
            />
          </Col>
          <Col className="text-right">
            <Button
              disabled={!this.state.campaigns && !this.state.addedon_min}
              onClick={() => this.save()}
              color="primary"
            >
              Generate Report
            </Button>{" "}
            <Button onClick={() => this.cancel()} color="danger">
              Cancel
            </Button>
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
      getReport,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DialerReports);
