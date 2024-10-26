
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import classnames from 'classnames';
import {
    Card, CardBody, Row, Col,
    Badge, TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import _ from 'lodash';
import Profile from './OrgProfile';
import { getRecord, getFieldView, getModuleDescription, deleteRecord, searchRecords, getAllRecords } from '../../action';
import CrmTable from '../table';
import history from '../../../../history';
import { ACCESS_LEVELS, CRM_PERMISSIONS, MODULES, searchTypes } from '../../config';
import { toastr } from 'react-redux-toastr';
import Modal from '../../../../components/Modal';
import Create from '../create';
import { checkPermission } from '../../../../config/util';
import { CUSTOM } from '../../../../custom';

const MODULE = "Accounts";

class DialFacility extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: null,
            loading: true,
            activeTab: "Contacts",
            searchType: searchTypes.CONTACT_ID,
            messages: "",
            hasOrderAccess: false,
            editable: {},
            deletable: {},
            readable: {}
        };
    }

    componentWillMount() {
        Object.keys(CUSTOM.CRM_MODULES || MODULES).map((module) => {
            this.props.getFieldView(module);
            this.props.getModuleDescription(module);
        });

        const editable = {};
        const deletable = {};
        const readable = {};
        Object.keys(MODULES).forEach((module) => {
            const perm = CRM_PERMISSIONS[module];
            readable[module] = checkPermission(perm, ACCESS_LEVELS.VIEW);
            editable[module] = checkPermission(perm, ACCESS_LEVELS.EDIT);
            deletable[module] = checkPermission(perm, ACCESS_LEVELS.DELETE);

        })
        this.setState({
            deletable,
            editable,
            readable
        })

        this.setState({ hasOrderAccess: checkPermission('Sales Order Management', 'READ') });
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            this.setState({ id: this.props.match.params.id });
            this.getContact(this.props.match.params.id);

            if (this.state.readable["Contacts"]) {
                this.props.searchRecords("Contacts", [{
                    "field": "account_id",
                    "value": this.props.match.params.id
                }]);
            }

            if (this.state.readable["Assets"]) {
                this.props.searchRecords("Assets", [{
                    "field": "account",
                    "value": this.props.match.params.id
                }]);
            }

            if (this.state.readable["HelpDesk"]) {
                this.props.searchRecords("HelpDesk", [{
                    "field": "parent_id",
                    "value": this.props.match.params.id
                }]);
            }
        }
    }

    componentDidUpdate() {
        if (this.props.match.params.id && this.props.match.params.id !== this.state.id) {
            this.setState({ id: this.props.match.params.id });
            this.getContact(this.props.match.params.id);
            this.props.customerOrders(this.props.match.params.id);
        }
    }

    handleEditTicket(module, row) {
        this.setState({ module, selected: row, mode: "edit", showTicket: true });
    }

    handleViewTicket(module, row) {
        if (module === "Contacts") {
            this.props.history.push(`/contacts/${row.id}`, row);
        } else {
            this.setState({ module, selected: row, mode: "view", showTicket: true });
        }
    }

    deleteTicket(module, row) {
        if (window.confirm("Are you sure, you want to delete this record?")) {
            this.props.deleteRecord(module, row.id, [{
                "field": "account_id",
                "value": this.props.match.params.id
            }]);
        }
    }

    getContact(id) {
        this.props.getRecord(MODULE, id, () => {
            this.setState({ loading: false });
        })
    }

    search() {
        this.props.searchRecords(MODULE, [
            {
                "field": this.state.searchType.value,
                "value": this.state.query
            }], (err, data) => {
                console.log(data);
                if (data) {
                    history.push(`/contacts/${data.id}`);
                } else {
                    toastr.error("No records found");
                }
            })
    }

    render() {
        const { crm_records, contact } = this.props;


        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Business Partner</li>
                </ol>
                <div className="container-fluid mb-5">

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    {_.isEmpty(contact) ? "No data available to display" :
                                        <Profile contact={contact} onNewTicket={(module) => this.setState({ showTicket: true, selected: null, mode: "create", module })} />
                                    }
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <CardBody className="p-1 bg-light">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === 'Contacts' })}
                                                onClick={() => { this.setState({ activeTab: 'Contacts' }) }}
                                            >
                                                <i className='fa fa-users' /> {(CUSTOM.CRM_MODULES || MODULES).Contacts} {" "}
                                                {crm_records && crm_records["Contacts"] ? <Badge color="danger">{crm_records["Contacts"].length}</Badge> : ""}
                                            </NavLink>
                                        </NavItem>
                                        {this.state.readable["Assets"] ? <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === 'Assets' })}
                                                onClick={() => { this.setState({ activeTab: 'Assets' }) }}
                                            >
                                                <i className='fa fa-cubes' /> {(CUSTOM.CRM_MODULES || MODULES).Assets} {" "}
                                                {crm_records && crm_records["Assets"] ? <Badge color="danger">{crm_records["Assets"].length}</Badge> : ""}
                                            </NavLink>
                                        </NavItem> : ""}
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === 'HelpDesk' })}
                                                onClick={() => { this.setState({ activeTab: 'HelpDesk' }) }}
                                            >
                                                <i className='fa fa-ticket' /> {(CUSTOM.CRM_MODULES || MODULES).HelpDesk} {" "}
                                                {crm_records && crm_records["HelpDesk"] ? <Badge color="danger">{crm_records["HelpDesk"].length}</Badge> : ""}
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab}>
                                        {["Contacts", "Assets", "HelpDesk"].map((module) => this.state.readable[module] ? <TabPane tabId={module}>
                                            <div className='d-flex flex-column'>
                                                <div className='mb-2'>
                                                    <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a>
                                                </div>
                                                <CrmTable
                                                    onEditRow={(e) => this.handleEditTicket(module, e)}
                                                    onViewRow={(e) => this.handleViewTicket(module, e)}
                                                    onDeleteRow={(e) => this.deleteTicket(module, e)}
                                                    showLegend={this.state.showLegend}
                                                    module={module}
                                                    hideDescription={module !== "HelpDesk"}
                                                    editable={this.state.editable[module]}
                                                    deletable={this.state.deletable[module]}
                                                />
                                            </div>
                                        </TabPane> : "")}
                                    </TabContent>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Modal size="lg" title={(CUSTOM.CRM_MODULES || MODULES)[this.state.module]} toggle={() => { this.setState({ showTicket: !this.state.showTicket }) }} isOpen={this.state.showTicket}>
                    <Create columns={3}  onCancel={(a) => this.setState({ showTicket: false })} module={this.state.module} profile={this.state.id} data={this.state.selected ? this.state.selected : { account_id: this.state.id, customer: this.state.id }} mode={this.state.mode} />
                </Modal>
            </div >
        );
    }
}

function mapStateToProps({ field_list, crm_records_page, crm_record, sales_orders }) {
    return {
        field_list: field_list[MODULE],
        contact: crm_record[MODULE],
        crm_records: crm_records_page,
        sales_orders
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getRecord,
        getFieldView,
        getModuleDescription,
        deleteRecord,
        getAllRecords,
        searchRecords
    }, dispatch);
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(DialFacility);
