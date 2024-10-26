import React, { Component } from 'react';
import { Badge, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { DISPOSITION_BUTTON, DYNAMIC_DISPOSITION_FORMS, FEEDBACK_LINK, PHONE_STATUS_COLORS } from '../../../config/globals';
import Modal from '../../../components/Modal';
import DispositionForm from '../../disposition-forms/views/send';
import { checkPermission } from '../../../config/util';
import { sendFeedbackLink } from '../../../actions/feedback';
import Create from './create';
import { withRouter } from 'react-router';
import { updateCallAdditionalDetailsAfterCall } from '../action';
class PhoneStatus extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasDispositionAccess: false,
            hasFeedbackAccess: false,
            editmode: false,
            feedbackSent: false,
            transferMode: false
        };
    }

    componentWillMount() {

        this.setState({ hasDispositionAccess: checkPermission('Disposition Management', 'WRITE') });
        this.setState({ hasFeedbackAccess: checkPermission('Feedback Management', 'WRITE') });
    }

    componentDidMount() {
        this.init({});
    }

    componentDidUpdate(prevProps) {
        this.init();

        if (prevProps.phone_status && prevProps.phone_status.status === "oncall" && this.props.phone_status.status !== "oncall") {
            if (localStorage.getItem("last_dispostion")) {
                const data = JSON.parse(localStorage.getItem("last_dispostion"));
                this.props.updateCallAdditionalDetailsAfterCall(prevProps.phone_status.customer_number, data);
                localStorage.removeItem("last_dispostion");
            }
        }
    }

    init() {
        if (this.props.phone_status && this.props.phone_status.customer_number && this.props.phone_status.customer_number !== this.state.customer_number) {
            this.setState({
                customer_number: this.props.phone_status.customer_number,
                elapsed_time: this.props.phone_status.elapsed_time,
                last_call_queue: this.props.phone_status.last_call_queue,
                feedbackSent: false
            })
        }
    }

    sendFeedbackLink() {
        this.setState({ feedbackSent: true });
        this.props.sendFeedbackLink({ phone: this.props.phone_status.customer_number, queue: this.props.phone_status.last_call_queue }, (err) => {
            if (err) {
                this.setState({ feedbackSent: false });
            }
        });
    }

    getColor(status) {
        if (this.state.hasWriteAccess) {
            if (status === "aftercall")
                return { color: "info", label: "Add Disposition" }
        }
        return PHONE_STATUS_COLORS[status] || PHONE_STATUS_COLORS.loading
    };

    renderStatus(){
        let status = "";
        if(this.props.phone_status.direction === "inbound" || this.props.phone_status.status === "ringing"){
            status = "[IN]" 
        }else if(this.props.phone_status.direction === "outbound" || this.props.phone_status.status === "dialing"){
            status = "[OUT]"
        }

        if(this.props.phone_status.customer_number && parseInt(this.props.phone_status.customer_number)){
            status += " " + this.props.phone_status.customer_number
        }

        if(status){
            status += " - ";
        }

        status += this.getColor(this.props.phone_status.status).label;

        return status;
    }


    render() {
        const { location } = this.props
        if (!this.props.phone_status) {
            return <div></div>
        }

        return (
            <h5 className='m-0'>
                <Badge
                    size='lg'
                    style={{ cursor: this.props.phone_status.customer_number ? "pointer" : "not-allowed" }}

                    color={this.getColor(this.props.phone_status.status).color}
                    className='text-uppercase px-1 badge-lg d-flex align-items-center'>
                    <div className='p-2'>
                        {this.renderStatus()}
                    </div>
                    {this.props.user.outbound_mode !== "1" && this.props.phone_status.customer_number && this.props.phone_status.last_call_queue && this.state.hasDispositionAccess && this.props.phone_status.status === "aftercall" && location.pathname !== '/disposition-notes' && DISPOSITION_BUTTON ?
                        <Button onClick={() => this.setState({ editmode: true })} size='sm' className='ml-1'>Add Disposition</Button> : ""}
                    {this.props.phone_status.customer_number && this.props.phone_status.last_call_queue && this.state.hasFeedbackAccess && FEEDBACK_LINK ? <Button disabled={this.state.feedbackSent} onClick={() => this.sendFeedbackLink()} size='sm' className='ml-1'>Send Feedback Link</Button> : ""}
                </Badge>
                <Modal toggle={() => { this.setState({ editmode: false }) }} title="Add Disposition" isOpen={this.state.editmode}>
                    {DYNAMIC_DISPOSITION_FORMS ?
                        <DispositionForm inbound={true} queue={this.state.last_call_queue} onSuccess={() => this.setState({ editmode: false, })} elapsed_time={this.state.elapsed_time} customer_number={this.state.customer_number} /> :
                        <Create queue={this.state.last_call_queue && this.props.phone_status.direction === "inbound" ? this.state.last_call_queue : this.props.user.user_details.outboundservice ? this.props.user.user_details.outboundservice.queue || this.props.user.user_details.outboundservice.service_name : undefined} onClose={() => this.setState({ editmode: false })} elapsed_time={this.state.elapsed_time} customer_number={this.state.customer_number} />}
                </Modal>
            </h5>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        sendFeedbackLink,
        updateCallAdditionalDetailsAfterCall
    }, dispatch);
}

function mapStateToProps({ phone_status, user }) {
    return {
        phone_status,
        user
    };
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(PhoneStatus);
