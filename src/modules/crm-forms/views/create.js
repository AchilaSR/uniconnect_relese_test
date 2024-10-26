import React, { Component } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { create, getDependencies } from "../action";
import { MODULES } from "../../crm/config";
import { CUSTOM } from "../../../custom";
import Select from "react-select";
import { getModuleDescription } from "../../crm/action";
import BootstrapTable from "react-bootstrap-table-next";

function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "",
      sourceField: "",
      targetField: "",
      sourceValue: "",
      schema: JSON.stringify({}),
      targetFields: [],
      sourceFields: [],
      sourceFieldPicklistValues: [],
      selectedPicklistValues: [],
      dependencies: [], // Store multiple dependencies here
    };
  }

  setPicklistValues(selectedValues) {
    // Update both sourceValue and selectedPicklistValues states
    this.setState({
      sourceValue: selectedValues || [], // Set to an empty array if selectedValues is null
      selectedPicklistValues: selectedValues
        ? selectedValues.map((value) => value.value)
        : [],
    });
  }

  generateSchema() {
    const { dependencies } = this.state;

    if (!dependencies || dependencies.length === 0) {
      return JSON.stringify({}, null, 2); // Return empty schema
    }

    const schemas = dependencies.map((dependency) =>
      JSON.stringify(dependency, null, 2)
    );

    return schemas.join(",\n");
  }

  save(e) {
    e.preventDefault();

    const { module, dependencies } = this.state; // Use the current dependencies

    const schemaObject = dependencies.reduce((result, dependency) => {
      const targetFieldKey = Object.keys(dependency)[0];
      result[targetFieldKey] = dependency[targetFieldKey];
      return result;
    }, {});

    const data = {
      module,
      schema: schemaObject, // Use the current dependencies to construct the schema
      id: this.state.id,
    };

    this.props.create(data, (err) => {
      if (!err) {
        this.setState({
          schema: JSON.stringify(schemaObject, null, 2), // Update schema in state
          id: null,
          loading: false,
          module: "" //comment if need to stay in selected module after save CRM form template
        });
      }
    });
  }


  addDependency() {
    const {
      schema,
      targetField,
      sourceField,
      selectedPicklistValues,
      dependencies,
    } = this.state;

    if (!isValidJSON(schema)) {
      alert("Invalid JSON format. Please enter valid JSON.");
      return;
    }

    const newDependency = {
      [targetField.name]: {
        [sourceField.name]: selectedPicklistValues,
      },
    };

    // Check if there is an existing dependency with the same Target Field
    const existingDependencyIndex = dependencies.findIndex((dependency) =>
      dependency.hasOwnProperty(targetField.name)
    );

    if (existingDependencyIndex !== -1) {
      const existingDependency = dependencies[existingDependencyIndex];

      // Check if the Source Field already exists within the Target Field
      if (
        existingDependency[targetField.name].hasOwnProperty(sourceField.name)
      ) {
        // Replace the existing Source Field values with the new ones
        existingDependency[targetField.name][sourceField.name] =
          selectedPicklistValues;
      } else {
        // Create a new Source Field
        existingDependency[targetField.name][sourceField.name] =
          selectedPicklistValues;
      }
    } else {
      // No existing dependency with the same Target Field, add the new dependency
      dependencies.push(newDependency);
    }

    // Convert the array of dependencies to an object
    const schemaObject = dependencies.reduce((result, dependency) => {
      const targetFieldKey = Object.keys(dependency)[0];
      result[targetFieldKey] = dependency[targetFieldKey];
      return result;
    }, {});

    // Update the schema
    this.setState({
      dependencies: [...dependencies],
      schema: JSON.stringify(schemaObject, null, 2),
      targetField: "",
      sourceField: "",
      sourceValue: "",
      selectedPicklistValues: [], // Reset Source Value
    });
  }


  clearForm() {
    this.setState({
      sourceField: "",
      targetField: "",
      sourceValue: "",
      schema: JSON.stringify({}),
      selectedPicklistValues: [],
      dependencies: [],
    });
  }

  onModuleChange(module) {
    this.setState({ module, loading: true });

    if (module) {
      this.props.get(module, (data) => {
        if (data && data.id) {
          this.setState({
            id: data.id,
            schema: data.schema ? JSON.stringify(data.schema, null, 2) : JSON.stringify({}),
            loading: false,
          });

          // Convert object to array and load previous schema data into the table
          if (typeof data.schema === 'object') {
            const dependenciesArray = Object.entries(data.schema).map(([key, value]) => ({
              [key]: value
            }));
            this.setState({ dependencies: dependenciesArray });
          } else if (Array.isArray(data.schema)) {
            this.setState({ dependencies: data.schema });
          }
        } else {
          this.setState({
            schema: JSON.stringify({}),
            id: null,
            loading: false,
            dependencies: [], // Clear the table when no schema data is available
          });
        }
      });

      this.props.getModuleDescription(module);
      this.clearForm();
    }
  }



  handleDelete(index) {
    const updatedDependencies = [...this.state.dependencies];
    updatedDependencies.splice(index, 1);

    this.setState({ dependencies: updatedDependencies });
  }

  renderSchemaTable() {
    const { dependencies } = this.state;

    if (!dependencies || dependencies.length === 0) {
      return null; // Don't render anything if there are no dependencies
    }

    const renderCell = (cell) => {
      const field = _.find(this.props.module_description[this.state.module], { name: cell.toString() });
      return <div className="d-flex justify-content-between align-items-center">{field ? field.label : "Deleted Field"} <small>{cell}</small></div>
    }

    const columns = [
      {
        dataField: "targetField",
        text: "Target Field",
        formatter: renderCell,
        sort: true,
        headerStyle: {
          width: 100
        },
      },
      {
        dataField: "sourceField",
        text: "Source Field",
        formatter: renderCell,
        sort: true,
        headerStyle: {
          width: 100
        },
      },
      {
        dataField: "sourceValues",
        text: "Source Values",
        sort: true,
        headerStyle: {
          width: 100
        },
      },
      {
        dataField: "delete",
        text: "",
        headerStyle: {
          width: 60
        },
        formatter: (cellContent, row, rowIndex) => (
          <div className="d-flex justify-content-around">
            <Button
              size="sm"
              outline
              onClick={() => this.handleDelete(rowIndex)}
              color="danger"
            >
              <i className="fa fa-trash"></i>
            </Button>
          </div>
        ),
      },
    ];

    const tableData = dependencies.map((dependency, index) => {
      const targetField = Object.keys(dependency)[0];
      const sourceFieldValues = dependency[targetField];

      const sourceFieldLines = Object.keys(sourceFieldValues).map((key) => key);

      const sourceValuesLines = Object.values(sourceFieldValues).map(
        (values) => values.join(", ")
      );

      return {
        targetField,
        sourceField: sourceFieldLines,
        sourceValues: sourceValuesLines,
        delete: index, // Pass the index for delete functionality
      };
    });

    return (
      <BootstrapTable keyField="delete" data={tableData} columns={columns} />
    );
  }

  render() {
    const { module_description } = this.props;
    const { targetField, sourceField, sourceValue } = this.state;
    const { dependencies } = this.state;

    const generatedSchema = this.generateSchema(
      targetField,
      sourceField,
      sourceValue
    );

    return (
      <CardBody>
        <form onSubmit={(e) => this.save(e)}>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Select Module</Label>
                <Input
                  value={this.state.module}
                  onChange={(e) => this.onModuleChange(e.target.value)}
                  type="select"
                >
                  <option value={""}>Select Module</option>
                  {Object.keys(CUSTOM.CRM_MODULES || MODULES).map((a) => (
                    <option value={a}>{MODULES[a]}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
          {this.state.module && module_description[this.state.module] ? (
            <>
              <Row>
                <Col>
                  <Card className="flex-grow-1">
                    <CardHeader>Select Dependencies</CardHeader>
                    <CardBody>
                      <FormGroup>
                        <Label htmlFor="name">Target Field</Label>
                        <Select
                          value={this.state.targetField}
                          options={module_description[this.state.module]}
                          onChange={(e) => this.setState({ targetField: e })}
                          isMulti={false}
                          className="multi-select"
                          getOptionValue={(option) => option["name"]}
                          getOptionLabel={(option) => option["label"]}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="name">Source Field</Label>
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
                      {this.state.sourceField ? (
                        <FormGroup>
                          <Label htmlFor="name">Source Value</Label>
                          <Select
                            value={this.state.sourceValue}
                            options={this.state.sourceField.type.picklistValues}
                            onChange={(e) => {
                              this.setState({ sourceValue: e });
                              this.setPicklistValues(e); // Call updateSchema with the selected values
                            }}
                            isMulti={true}
                            className="multi-select"
                            getOptionValue={(option) => option["value"]}
                            getOptionLabel={(option) => option["label"]}
                          />
                        </FormGroup>
                      ) : (
                        ""
                      )}
                      <Row>
                        <Col className="text-right">
                          <Button
                            disabled={
                              !this.state.targetField ||
                              !this.state.sourceField ||
                              !Array.isArray(this.state.sourceValue) || // Check if sourceValue is not an empty array
                              this.state.sourceValue.length === 0 // Check if sourceValue is an empty array
                            }
                            type="button"
                            color="primary"
                            onClick={() => this.addDependency()}
                          >
                            Add
                          </Button>{" "}
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col>
                  <Card className="flex-grow-1">
                    <CardHeader>Schema Table</CardHeader>
                    <CardBody>
                      {dependencies && dependencies.length > 0
                        ? this.renderSchemaTable()
                        : "No Records Found"}
                    </CardBody>
                  </Card>
                </Col>
                {/* <Col>
                 <FormGroup>
                    <Label htmlFor="name">Dependencies</Label>
                    <Input
                      disabled={this.state.loading}
                      className="monospace"
                      rows="20"
                      type="textarea"
                      placeholder="Enter the Schema in JSON format"
                      value={`${generatedSchema}`} // Display the generated schemas as an array of objects
                      onChange={(e) =>
                        this.setState({ schema: e.target.value })
                      }
                      required
                    />
                  </FormGroup></Col> */}
              </Row>
              <Row>
                <Col className="text-right">
                  <Button type="submit" color="primary">
                    Save
                  </Button>{" "}
                  <Button onClick={() => this.clearForm()} color="danger">
                    Cancel
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            ""
          )}
        </form>
      </CardBody>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      create,
      get: getDependencies,
      getModuleDescription,
    },
    dispatch
  );
}

function mapStateToProps({ module_description }) {
  return {
    module_description,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Create);
