
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, add } from '../action';
import Select from 'react-select';
import moment from 'moment';

class addCallLog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "",
            edit: null
        };
    }

    componentDidMount() {
        this.props.callLogs(this.props.data.call_id);
    }

    save() {
        const self = this;
        this.props.add({
            "id": this.props.data.call_id,
            "added_date": moment().format("YYYY-MM-DD HH:mm:ss"),
            "message": this.state.message
        }, () => {
            if (self.props.onSuccess) {
                self.props.onSuccess();
            }
        });
    }


    render() {
        const { data, call_logs_record } = this.props;
        const renderCallLog = () => {
            if (call_logs_record && !this.state.edit) {
                return (
                    <div>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <label>Added Date </label>
                                    <div><b>{call_logs_record.added_date}</b></div>
                                </FormGroup></Col>
                        </Row>
                        {/* <Row>
                            <Col>
                                <FormGroup>
                                    <label>Added By </label>
                                    <div><b>{call_logs_record.added_by}</b></div>
                                </FormGroup></Col>
                        </Row> */}
                        <Row>
                            <Col>
                                <FormGroup>
                                    <label>Message</label>
                                    <div><b>{call_logs_record.message}</b></div>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-right">
                                <Button onClick={() => { this.setState({ edit: true, message: call_logs_record.message }) }} color="primary">Edit</Button>{' '}
                                <Button disabled={!this.state.edit} onClick={() => this.save()} color="danger">Save</Button>{' '}
                            </Col>
                        </Row>
                    </div>
                );
            } else {
                return (
                    <div>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <label>Message</label>
                                    <Input placeholder="Message" type="textarea" value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} rows="5" />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-right">
                                <Button disabled={!(this.state.message || "").trim()} onClick={() => this.save()} color="primary">Submit</Button>{' '}
                            </Col>
                        </Row>
                    </div>
                );
            }
        }

        return (
            <div>
                {renderCallLog()}

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        add,
        callLogs: index
    }, dispatch);
}

function mapStateToProps({ call_logs_record }) {
    return {
        call_logs_record
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(addCallLog);
