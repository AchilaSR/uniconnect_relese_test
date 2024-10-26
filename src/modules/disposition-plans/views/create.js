import React, { Component } from "react";
import {
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
import Select from "react-select";
import { create, remove } from "../action";
import Loader from "../../../components/Loader";

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plan_name: "",
      queue: "",
      dispositions: [],
      isEditing: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editData !== this.props.editData) {
      this.setState({
        ...this.initState(),
        isEditing: !!this.props.editData,
      });
    }
  }

  initState() {
    const { editData, queues } = this.props;
    const selectedQueue = editData
      ? queues.find((queue) => queue.extension === editData.queue.extension)
      : null;

    return {
      plan_name: editData ? editData.plan_name : "",
      queue: selectedQueue || null,
      dispositions: editData ? editData.dispositions : [],
    };
  }

  save(e) {
    e.preventDefault();

    const { editData } = this.props;
    const { isEditing } = this.state;

    if (isEditing && editData && editData.rowId) {
      this.props.removeTemplate(editData.rowId, (err) => {
        if (!err) {
          this.addUpdatedPlan();
        }
      });
    } else {
      this.addUpdatedPlan();
    }
  }

  addUpdatedPlan() {
    const data = {
      plan_name: this.state.plan_name,
      queue_extension: this.state.queue.extension,
      disposition_ids: (this.state.dispositions || []).map((a) => a.id),
    };
    console.log("Data send to create API:", data);

    this.props.create(data, (err) => {
      if (!err) {
        this.clearForm();
      }
    });
  }

  clearForm() {
    this.setState({
      plan_name: "",
      queue: "",
      dispositions: [],
      isEditing: false,
    });
  }
  handleCancelClick() {
    this.clearForm();
  }

  render() {
    const { dispositions, queues} = this.props;

    if (!dispositions || !queues) {
      return <Loader />;
    }

    return (
      <CardBody>
        <form onSubmit={(e) => this.save(e)}>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  placeholder="Enter the plan name"
                  value={this.state.plan_name}
                  onChange={(e) => this.setState({ plan_name: e.target.value })}
                  required
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Queue</Label>
                <Select
                  value={this.state.queue}
                  options={this.props.queues}
                  onChange={(e) => this.setState({ queue: e })}
                  getOptionValue={(option) => option["extension"]}
                  getOptionLabel={(option) => {
                    return `[${option["extension"]}]` + " " + option["display_name"];
                  }}
                  className="multi-select"
                  isClearable={true}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label htmlFor="name">Dispositions</Label>
                <Select
                  name="form-field-name2"
                  value={this.state.dispositions}
                  isMulti={true}
                  options={dispositions}
                  getOptionValue={(option) => option["id"]}
                  getOptionLabel={(option) => option["disposition"]}
                  onChange={(e) => this.setState({ dispositions: e })}
                  placeholder="Choose a Class"
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col className="text-right">
              {this.state.isEditing ? (
                <>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={
                      !this.state.dispositions ||
                      this.state.dispositions.length === 0
                    }
                  >
                    Update
                  </Button>{" "}
                  <Button onClick={() => this.clearForm()} color="danger">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button type="submit" color="primary">
                  Add
                </Button>
              )}
            </Col>
          </Row>
        </form>
      </CardBody>
    );
  }
}

function mapStateToProps({ dispositions, queues }) {
  return {
    dispositions,
    queues,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      create,
      removeTemplate: remove,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Create);
