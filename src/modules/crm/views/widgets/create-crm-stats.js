import React, { Component } from "react";
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { create } from "../../../dashboards/action";
import Slider from "rc-slider";
import Select from "react-select";
import Loader from "../../../../components/Loader";
import "react-dates/initialize";
import { CUSTOM } from "../../../../custom";
import { MODULES } from "../../config";
import { getFieldView, getModuleDescription } from "../../action";
import FilterReport from '../filter';

class CreateCrmStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "",
      type: "counts",
      search_fileds: [],
      sourceField: "",
      sourceValue: [],
      refresh_intval: 30,
      title: "",
    };
  }

  save(e) {
    e.preventDefault();
    const data = {
      refresh_interval_seconds: this.state.refresh_intval * 1000,
      id: Date.now() % 1000000,
      type: "crm-" + this.state.type,
      title: this.state.title,
      module_name: this.state.module,
      search_fileds: this.state.search_fileds,
      sortField: this.state.sourceField.name,
      values: this.state.sourceValue.map((a) => a.value),
      selectedFields: this.state.selectedFields ? this.state.selectedFields.map((a) => a.name) : [],
      position: { x: 0, y: 1000, w: 4, h: this.state.type === "count" ? 6 : 24 }
    };
    this.props.onSaved(data);
  }



  clearForm() {
    this.setState({ message: "" });
    this.props.onCanceled();
  }

  render() {
    const { module_description } = this.props;

    return (
      <form onSubmit={(e) => this.save(e)}>
        <div className="d-flex">
          <div className="widget-button-container">
            {
              [
                { type: "counts", label: "Counts" },
                { type: "table", label: "Table" },
                { type: "kanban", label: "Kanban Board" }
              ].map(({ type, label }) => (<Button
                type="button"
                outline={this.state.type !== type}
                onClick={() => this.setState({ type })}
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
            <Row>
              <Col>
                <FormGroup>
                  <Label htmlFor="name">Module</Label>
                  <Input
                    value={this.state.module}
                    onChange={(e) => {
                      const module = e.target.value;
                      this.setState({ module });
                      this.props.getModuleDescription(module);
                      this.props.getFieldView(module);

                    }}
                    type="select"
                  >
                    <option value={""}>Select Module</option>
                    {Object.keys(CUSTOM.CRM_MODULES || MODULES).map((a) => (
                      <option value={a}>{MODULES[a]}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>{this.state.module ?
              <div className="my-3 rounded p-3 bg-light">
                {this.state.showFilters ?
                  <form onSubmit={(e) => e.preventDefault()} className="pr-3">
                    <h5>Filters</h5>
                    <FilterReport xs="6" onFilterChange={(data) => this.setState({ search_fileds: data, showFilters: false })} module={this.state.module} />
                  </form> :
                  <h6 onClick={() => this.setState({ showFilters: true })} className="mb-0 cursor">Show Filters</h6>}
              </div> : ""}
            <Row>
              {["kanban", "counts"].indexOf(this.state.type) > -1 && this.state.module ? (
                module_description && module_description[this.state.module] ?
                  <>
                    <Col md="12">
                      <FormGroup>
                        <Label htmlFor="name">Group By</Label>
                        <Select
                          value={this.state.sourceField}
                          options={module_description[this.state.module].filter(
                            (a) => a.type.name === "picklist"
                          )}
                          onChange={(e) => this.setState({ sourceField: e })}
                          isMulti={false}
                          className="multi-select"
                          getOptionValue={(option) => option["name"]}
                          getOptionLabel={(option) => option["label"]}
                        />
                      </FormGroup>
                    </Col>{this.state.sourceField ?
                      <Col md="12">
                        <FormGroup>
                          <Label htmlFor="name">Selected Values</Label>
                          <Select
                            value={this.state.sourceValue}
                            options={this.state.sourceField.type.picklistValues}
                            onChange={(e) => {
                              this.setState({ sourceValue: e });
                            }}
                            isMulti={true}
                            className="multi-select"
                            getOptionValue={(option) => option["value"]}
                            getOptionLabel={(option) => option["label"]}
                          />
                        </FormGroup>
                      </Col> : ""}
                  </> : <Loader />
              ) : (
                ""
              )}
            </Row>
            {
               ["kanban", "table"].indexOf(this.state.type) > -1 && this.state.module  ? <Row>
                <Col md="12">
                  <FormGroup>
                    <Label htmlFor="name">Selected Fields</Label>
                    <Select
                      value={this.state.selectedFields}
                      options={module_description[this.state.module]}
                      onChange={(e) => this.setState({ selectedFields: e })}
                      isMulti={true}
                      className="multi-select"
                      getOptionValue={(option) => option["name"]}
                      getOptionLabel={(option) => option["label"]}
                    />
                  </FormGroup>
                </Col>
              </Row> : ""
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

function mapStateToProps({ module_description }) {
  return {
    module_description,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      create,
      getModuleDescription,
      getFieldView
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCrmStats);
