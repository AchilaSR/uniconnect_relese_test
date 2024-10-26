import React, { Component } from 'react';
import { Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import _ from 'lodash';

import { formatDuration, formatTimeToSeconds } from '../../../../../config/util';

class EditSubConfig extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentWillMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.config !== prevProps.config) {
            this.init();
        }
    }

    init() {
        if (!this.props.config.sub_status_name) {
            this.setState({ sub_id: undefined, sub_status_name: "", approved_time: "00:00:00" })
        } else {
            this.setState({
                ...this.props.config,
            })
        }
    }

    clearForm() {
        this.props.onClose();
    }

    saveData() {
        const self = this;

        this.props.onChange({ ...this.state }, (err) => {
            if (!err) {
                self.clearForm();
            }
        });
    }


    render() {

        console.log("state", this.state)
        return (
            <form onSubmit={(e) => this.saveData(e)} >
                {/* <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="display_name">Sub Id</Label>
                                <Input type="text" onChange={(e) => this.setState({ display_name: e.target.value })} value={this.state.sub_id} />
                            </FormGroup>
                        </Col>
                    </Row> */}
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="display_name">Sub Status Name</Label>
                            <Input readOnly={this.state.sub_id} type="text" onChange={(e) => this.setState({ sub_status_name: e.target.value })} value={this.state.sub_status_name} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="display_name">Approved Time (Seconds)</Label>
                            <Input type="number" onChange={(e) => this.setState({ approved_time: formatDuration(e.target.value) })} value={formatTimeToSeconds(this.state.approved_time)} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button disabled={!this.state.sub_status_name} type="button" onClick={() => this.saveData()} color="primary">Save</Button>{' '}
                        <Button onClick={() => this.props.onClear()} color="danger">Cancel</Button>
                    </Col>
                </Row>
            </form>
        );
    }
}

export default EditSubConfig;
