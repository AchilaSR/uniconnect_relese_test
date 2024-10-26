

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Badge, Button, Col, Row } from 'reactstrap';
import { call, sendNotification } from '../../../actions/facilities';
import Modal from '../../../components/Modal';
import AddFollowup from './follow-up-note';
import SendSMS from '../../../modules/sms-templates/views/send';
import SendEmail from '../../../modules/email-templates/views/send';
import AddDispositionNote from '../../../modules/disposition-note-templates/views/send';
import DispositionForm from '../../../modules/disposition-forms/views/send';
import { DYNAMIC_DISPOSITION_FORMS, NOTIFICATION_CHANNELS } from '../../../config/globals';
import { checkPermission } from '../../../config/util';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            calling: false,
            showSMS: false,
            showEmail: false,
            showFollowup: false,
            showUnifiedMessage: false
        };
    }

    componentWillMount() {
        this.setState({ showUnifiedMessage: checkPermission('Unified Messaging', 'WRITE') });
    }

    componentDidUpdate(prevProps) {
        if (this.props.phone_status && prevProps.phone_status && (this.props.phone_status.status !== prevProps.phone_status.status)) {
            if (this.props.phone_status.status === "oncall") {
                this.setState({ called: true, calling: false });
            } else {
                this.setState({ called: false, calling: false });
            }
        }
    }

    call() {
        const self = this;
        const { number, id } = this.props.facility;
        self.setState({
            calling: true
        });
        this.props.call({
            "customer_id": id,
            "number": number
        }, function () {
            // self.setState({
            //     called: true
            // });
        });
    }

    render() {
        const { facility, field_layout } = this.props;
        // console.log(this.props)
        const custom_fields = _.filter(field_layout, { field_visibility: 1 }).map(({ field_id, field_label }) => ({
            field_id,
            field_label
        }));
        const colStyle = {
            width: 200
        }
        return (
            <div className="d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-start">
                    <div className=" flex-grow-1">
                        <h3>{facility.number}</h3>
                    </div>
                    <h4><Badge className='ml-auto text-uppercase'>[{facility.campaign_id}] {facility.campaign_name}</Badge></h4>
                </div>
                <div className="d-flex mt-auto">
                    <div className="d-flex flex-wrap flex-grow-1" style={{ minWidth: 350 }}>
                        <div className="py-3" style={colStyle}><small>Customer ID</small><br /><b>{facility.id}</b></div>
                        <div className="py-3" style={colStyle}><small>Uploaded On</small><br /><b>{facility.uploaded_on}</b></div>
                        {
                            custom_fields.map(a => <div style={colStyle} className="py-3" key={a.field_id}><small>{a.field_label}</small><br /><b>{facility[a.field_id] || "Unknown"}</b></div>)
                        }
                        {facility.disposition ? <div className="py-3" style={{ width: "100%" }}><small>Disposition</small><br /><b>{facility.disposition}</b></div> : ""}
                    </div>
                    <div style={{ width: 240 }} className="flex-shrink-0 pl-3" >
                        <Row className='mb-2'>
                            <Col className='pr-1'>
                                <Button disabled={this.props.disableDisposition} color="primary" onClick={() => { this.setState({ showDispositionNote: true }) }} className="btn-block">Disposition</Button>
                            </Col>
                            <Col className='pl-1'>
                                <Button disabled={this.props.disableDisposition} color="primary" onClick={() => { this.setState({ showFollowup: true }) }} className="btn-block">Follow Up</Button>
                            </Col>
                        </Row>
                        {this.state.showUnifiedMessage && (
                            <>
                                <Row className='mb-2'>
                                    <Col className='pr-1'>
                                        <Button color="success" onClick={() => { this.setState({ showEmail: true }) }} className="btn-block">Send Email</Button>
                                    </Col>
                                    <Col className='pl-1'>
                                        <Button className="btn-block" onClick={() => { this.setState({ showSMS: true }) }} color="success">Send SMS</Button>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {this.state.called ?
                            <Button className="btn-block" onClick={() => this.setState({ called: false, calling: false })} color="danger">Cancel</Button> :
                            <Button disabled={this.state.calling} className="btn-block" onClick={() => this.call()} color="success">{this.state.calling ? "Dialing" : "Call"}</Button>
                        }
                    </div>
                </div>
                <Modal title="Send Email" toggle={() => { this.setState({ showEmail: !this.state.showEmail }) }} isOpen={this.state.showEmail}>
                    <SendEmail onSuccess={() => { this.setState({ showEmail: false }) }} email={facility.cf_email ? facility.cf_email : null} />
                </Modal>
                <Modal title="Send SMS" toggle={() => { this.setState({ showSMS: !this.state.showSMS }) }} isOpen={this.state.showSMS}>
                    <SendSMS onSuccess={() => { this.setState({ showSMS: false }) }} contacts={[{ label: facility.number, value: facility.number }]} />
                </Modal>
                <Modal title="Add Follow-Up Reminder" toggle={() => { this.setState({ showFollowup: !this.state.showFollowup }) }} isOpen={this.state.showFollowup}>
                    {DYNAMIC_DISPOSITION_FORMS ?
                        <DispositionForm followup={true} queue={facility.queue} onSuccess={() => { this.setState({ showFollowup: false }); this.props.refresh(); this.props.onDispositionAdded(); }} customer_number={facility.number} onNotify={(assignee, message) => { NOTIFICATION_CHANNELS ? this.props.sendNotification(assignee, message) : "" }} customer={facility} /> :
                        <AddFollowup queue={facility.queue} onSuccess={() => { this.setState({ showFollowup: false }); this.props.onDispositionAdded() }} customer_id={facility.id} customer_number={facility.number} />}
                </Modal>
                <Modal title="Add Disposition Note" toggle={() => { this.setState({ showDispositionNote: !this.state.showDispositionNote }) }} isOpen={this.state.showDispositionNote}>
                    {DYNAMIC_DISPOSITION_FORMS ?
                        <DispositionForm queue={facility.queue} onSuccess={() => { this.setState({ showDispositionNote: false }); this.props.refresh(); this.props.onDispositionAdded(); }} customer_number={facility.number} customer={facility} /> :
                        <AddDispositionNote queue={facility.queue} onSuccess={() => { this.setState({ showDispositionNote: false }); this.props.refresh(); this.props.onDispositionAdded(); }} customer={facility} />}
                </Modal>
            </div>)
    }
}

function mapStateToProps({ field_layout, phone_status }) {
    return {
        field_layout,
        phone_status
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        call,
        sendNotification
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);