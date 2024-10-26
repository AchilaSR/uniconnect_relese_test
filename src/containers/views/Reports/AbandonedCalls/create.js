import React, { Component } from "react";
import { CardBody, Row, Col, FormGroup, Label, Button,Input } from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getAbandonedCalls } from "../../../../actions/reports";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import moment from "moment";
import { listQueues } from "../../../../actions/configurations";
import Select from "react-select";
import _ from "lodash";
import ReportScheduleButton from "../../../../modules/report-automation/views/button";

class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      date_range: {
        start: moment().startOf("month"),
        end: moment(),
      },
      hour_range: {
        start: "00:00",
        end: "23:59",
      },
      selectAllQueues: false,
    };
  }

  componentWillMount() {
    this.props.listQueues();
  }

  reportData() {
    const queueExtensions = this.state.selectAllQueues
  ? (this.props.queues || []).map(item => item.extension)
  : this.state.queue.map(item => item.extension);

    const queueString = queueExtensions.join(" ");
    const startDate = this.state.date_range.start.format("YYYY-MM-DD");
    const endDate = this.state.date_range.end ? this.state.date_range.end.format("YYYY-MM-DD"): null;

    return {
      queue: queueString,
      date_range: {
        start: startDate,
        end: endDate,
      },
    };
  }

generateReport() {
  if (this.state.selectAllQueues || (this.state.queue && this.state.queue.length > 0)) {
    const filters = this.reportData();
    this.props.getAbandonedCalls(filters, () => {
      this.cancel();
    });
  } else {
    alert("Please fill all the fields");
  }
}


checkFields() {
  if (this.state.selectAllQueues || (this.state.queue && this.state.queue.length > 0)) {
    return this.reportData();
  }
  return null;
}

  render() {
    return (
      <CardBody>
        <Row>
          <Col xs="12">
            <FormGroup>
              <Label htmlFor="name">Date Range</Label>
              <DateRangePicker
                minimumNights={0}
                startDate={this.state.date_range.start}
                startDateId="startDate"
                endDate={this.state.date_range.end}
                endDateId="endDate"
                onDatesChange={({ startDate, endDate }) =>
                  this.setState({
                    date_range: { start: startDate, end: endDate },
                  })
                }
                focusedInput={this.state.focusedInput}
                onFocusChange={focusedInput =>
                  this.setState({ focusedInput })
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
          <Col xs="12">
            <FormGroup>
              <Label htmlFor="name">Queues</Label>
              <Select
                value={this.state.queue}
                options={this.props.queues || []}
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
          <Col>
            <ReportScheduleButton
              api={"getAbandondedCounts"}
              data={this.checkFields()}
            />
          </Col>
          <Col className="text-right">
            <Button onClick={() => this.generateReport()} color="primary">
              Generate Report
            </Button>{" "}
          </Col>
        </Row>
      </CardBody>
    );
  }
}

function mapStateToProps({ configurations, metadata, queues }) {
  return {
    configurations,
    metadata,
    queues,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getAbandonedCalls,
      listQueues,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateGroup);
