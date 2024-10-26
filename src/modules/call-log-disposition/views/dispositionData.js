
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getDispositionByID } from '../action';
import Select from 'react-select';
import moment from 'moment';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';

class getDispositionData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: "",
            edit: null
        };
    }

    componentDidMount() {
        console.log("didmount")
        this.props.getDispositionByID(this.props.data.call_id);
    }

    save() {
        const self = this;
        // this.props.add({
        //     "id": this.props.data.call_id,
        //     "added_date": moment().format("YYYY-MM-DD HH:mm:ss"),
        //     "message": this.state.message
        // }, () => {
        //     if (self.props.onSuccess) {
        //         self.props.onSuccess();
        //     }
        // });
    }


    render() {
        const { disposition_data } = this.props;
        console.log(disposition_data)

        const renderDynamicDisposition = () => {
            if (disposition_data && disposition_data.disposition) {
                return (
                    <div>

                        <Row>
                            <Col>
                                <FormGroup>
                                    <ul className='form-list' >
                                        {disposition_data.disposition.data.map(([key, value], index) => value ? <li key={index}><label>{key}</label> {typeof value === "object" ? JSON.stringify(value) : value}</li> : "")}
                                    </ul>
                                </FormGroup></Col>
                        </Row>
                    </div>
                );
            } else {
                return (
                    <div>
                        < Row>
                            <Col>
                                <FormGroup>
                                    <div><b>No data found!</b></div>
                                </FormGroup></Col>
                        </Row>
                    </div>
                )
            }
        }

        const renderDialogDisposition = () => {
            if (disposition_data && disposition_data.comments) {
                return (
                    <div>

                        <Row>
                            <Col>
                                <FormGroup>
                                    <div><b>{disposition_data.comments}</b></div>
                                </FormGroup></Col>
                        </Row>
                    </div>
                );
            } else {
                return (
                    <div>
                        < Row>
                            <Col>
                                <FormGroup>
                                    {/* <label>Updated_time</label> */}
                                    <div><b>No data found!</b></div>
                                </FormGroup></Col>
                        </Row>
                    </div>
                )
            }
        }

        return (
            <div>
                {DYNAMIC_DISPOSITION_FORMS ? renderDynamicDisposition() : renderDialogDisposition()}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getDispositionByID
    }, dispatch);
}

function mapStateToProps({ disposition_data }) {
    return {
        disposition_data
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(getDispositionData);
