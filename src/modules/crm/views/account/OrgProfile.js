

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { call } from '../../../../actions/facilities';
import Modal from '../../../../components/Modal';
import Create from '../create';
import SendSMS from '../../../sms-templates/views/send';
import SendEmail from '../../../email-templates/views/send';
import { checkPermission, singularize } from '../../../../config/util';
import FieldValue from '../components/FieldValue';
import Loader from '../../../../components/Loader';
import correctDate from '../components/dateField';
import { Button, Col, Row } from 'reactstrap';
import { MODULES } from '../../config';
import { CUSTOM } from '../../../../custom';

const MODULE = "Accounts";

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showSMS: false,
            showEmail: false,
            hasOrderAccess: false
        };
    }

    componentWillMount() {
        this.setState({ hasOrderAccess: checkPermission('Sales Order Management', 'READ') });

    }

    renderField({name, label}) {
        const colStyle = {
            width: 180
        }
        const { module_description, contact } = this.props;
        const field = _.find(module_description, { name });
        if (field && contact[name]) {
            return <div style={colStyle} className="pb-2" key={name}>
                <small>{label}</small>
                <br />
                <b>{field.type.name === "owner" ? <FieldValue module={"Users"} id={contact[name]} /> :
                    field.type.name === "reference" ? <FieldValue module={field.type.refersTo} id={contact[name]} /> :
                        (field.type.name === "date" || field.type.name === "datetime") ? correctDate(contact[name]) :
                            contact[name] || "Unknown"}</b>
            </div>
        }
    }

    render() {
        const { contact, field_list } = this.props;

        if (!field_list) {
            return <Loader />;
        }

        return (
            <div>
                <div className="d-flex">
                    <div className='mr-3'>
                        <div className='profile_pic'>
                            <i className='fa fa-briefcase'></i>
                        </div>
                    </div>
                    <div>
                        <div className="d-flex flex-wrap flex-grow-1">
                            {
                                field_list[0].fields.map(a => this.renderField(a))
                            }
                        </div>
                    </div>
                    {/* <div className='mx-3' style={{ minWidth: 220 }}>
                        <Row className='mb-2'>
                            <Col className='px-1'>
                                <Button color="primary" onClick={() => { this.setState({ showEdit: true }) }} className="btn-block">Edit Account</Button>
                            </Col>
                            <Col className='px-1'>
                                <Button color="primary" onClick={() => { this.props.onNewTicket("Contact") }} className="btn-block">Add {singularize((CUSTOM.CRM_MODULES || MODULES).Contacts)}</Button>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col className='px-1'>
                                <Button color="primary" onClick={() => { this.props.onNewTicket("HelpDesk") }} className="btn-block">Add {singularize((CUSTOM.CRM_MODULES || MODULES).HelpDesk)}</Button>
                            </Col>
                            <Col className='px-1'>
                                <Button color="primary" onClick={() => { this.props.onNewTicket("ModComments") }} className="btn-block">Add Comment</Button>
                            </Col>
                        </Row>
                    </div> */}
                </div>
                <Modal size="lg" title="Edit Profile" toggle={() => { this.setState({ showEdit: !this.state.showEdit }) }} isOpen={this.state.showEdit}>
                    <Create columns={3} onCancel={(a) => this.setState({ showEdit: false })} module={"Accounts"} data={contact} />
                </Modal>
            </div>)
    }
}

function mapStateToProps({ field_list, module_description }) {
    return {
        field_list: field_list[MODULE],
        module_description: module_description[MODULE],
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        call
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);