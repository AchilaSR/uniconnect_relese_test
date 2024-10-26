

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Col, Row } from 'reactstrap';
import { call } from '../../../../actions/facilities';
import Modal from '../../../../components/Modal';
import Create from '../create';
import SendSMS from '../../../sms-templates/views/send';
import SendEmail from '../../../email-templates/views/send';
import avatar from "../../../../theme/avatar.jpg";
import { checkPermission, singularize } from '../../../../config/util';
import history from '../../../../history';
import correctDate from '../components/dateField';
import FieldValue from '../components/FieldValue';
import { CUSTOM } from '../../../../custom';
import { ACCESS_LEVELS, CRM_PERMISSIONS, MODULES } from '../../config';
import { CRM_FIELDS_PHONE } from '../../../../config/globals';


const MODULE = "Contacts";

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

    renderField({ name, label }) {
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

    renderCustomAcionButtons() {
        const { contact } = this.props;

        const items = []
        if (CUSTOM && CUSTOM.CONTACT_ACTIONS) {
            for (let a in CUSTOM.CONTACT_ACTIONS) {
                const action = CUSTOM.CONTACT_ACTIONS[a];
                if (checkPermission(action.permission, 'WRITE')) {
                    items.push(<Col md="4" className='px-1 my-1'>
                        <Button color="primary" onClick={() => { this.setState({ [a]: true }) }} className="btn-block">{action.label}</Button>
                    </Col>)

                    const View = require("../../../" + action.path).default;

                    items.push(<Modal size="xl" title={action.label} toggle={() => { this.setState({ [a]: !this.state[a] }) }} isOpen={this.state[a]}>
                        <View onSuccess={() => { this.setState({ [a]: false }); }} contact={contact} />
                    </Modal>);
                }
            }
        }

        return items;
    }

    render() {
        const { contact, field_list } = this.props;

        const contacts = _.uniqBy(CRM_FIELDS_PHONE.map((a) => ({ label: contact[a], value: contact[a] })).filter((a) => a.value), "label");

        return (
            <div>
                <div className="d-flex">
                    <div className='mr-3'>
                        <img className='profile_pic' src={avatar} alt={contact.id} />
                    </div>
                    <div className="d-flex flex-wrap flex-grow-1">
                        {
                            field_list[0].fields.map(a => this.renderField(a))
                        }
                    </div>
                    <div className='mx-3' style={{ minWidth: 340, maxWidth: 340 }}>
                        <Row className='mb-2'>
                            <Col md="6" className='px-1 my-1'>
                                <Button color="success" onClick={() => { this.setState({ showEmail: true }) }} className="btn-block">Send Email</Button>
                            </Col>
                            <Col md="6" className='px-1 my-1'>
                                <Button className="btn-block" onClick={() => { this.setState({ showSMS: true }) }} color="success">Send SMS</Button>
                            </Col>
                            <div className='d-flex flex-wrap justify-content-center'>
                                {checkPermission(CRM_PERMISSIONS.Contacts, ACCESS_LEVELS.EDIT) ?
                                    <Button style={{ minWidth: 100 }} className='mx-1 my-1 flex-grow-1' color="primary" onClick={() => { this.setState({ showEdit: true }) }}>Edit Profile</Button>
                                    : ""}
                                {
                                    (CUSTOM.CRM_CONTACT_BUTTONS || CUSTOM.CRM_CONTACT_RELATIONS || ["HelpDesk", "ModComments"]).map((module) => checkPermission(CRM_PERMISSIONS[module], ACCESS_LEVELS.CREATE) ?
                                        <Button style={{ minWidth: 100 }} className='mx-1 my-1 flex-grow-1' color="primary" onClick={() => { this.props.onNewTicket(module) }}> Add {singularize((CUSTOM.CRM_MODULES && CUSTOM.CRM_MODULES[module]) || MODULES[module])}</Button>
                                        : "")
                                }
                            </div>
                            {
                                this.renderCustomAcionButtons()
                            }

                        </Row>
                        {contact["account_id"] ? <Row>
                            <Col className='px-1'>
                                <Button color="secondary" onClick={() => { history.push(`/account/${contact["account_id"]}`, null); }} className="btn-block">View Business Partner Account</Button>
                            </Col>
                        </Row> : ""}
                    </div>
                </div>
                {/* {this.state.hasOrderAccess ?
                    <Modal size="xl" title="New Order" toggle={() => { this.setState({ showOrder: !this.state.showOrder }) }} isOpen={this.state.showOrder}>
                        <CreateOrder onSuccess={() => { this.setState({ showOrder: false }); }} contact={contact} />
                    </Modal> : ""} */}
                <Modal size={"lg"} title="Edit Profile" toggle={() => { this.setState({ showEdit: !this.state.showEdit }) }} isOpen={this.state.showEdit}>
                    <Create columns={3} mode="edit" onCancel={(a) => this.setState({ showEdit: false })} module={"Contacts"} data={contact} />
                </Modal>
                <Modal title="Send Email" toggle={() => { this.setState({ showEmail: !this.state.showEmail }) }} isOpen={this.state.showEmail}>
                    <SendEmail onSuccess={() => { this.setState({ showEmail: false }) }} email={contact.email} />
                </Modal>
                <Modal title="Send SMS" toggle={() => { this.setState({ showSMS: !this.state.showSMS }) }} isOpen={this.state.showSMS}>
                    <SendSMS onSuccess={() => { this.setState({ showSMS: false }) }} contacts={contacts} phone_number={contacts[0]} />
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