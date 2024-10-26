
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import classnames from 'classnames';
import {
    Card, CardBody, Row, Col, Input, Button, InputGroup,
    FormGroup, Label,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Badge, TabContent, TabPane, Nav, NavItem, NavLink, CardHeader, Alert
} from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import _ from 'lodash';
import Profile from './MainProfile';
import { getRecord, getFieldView, getModuleDescription, deleteRecord, searchRecords, getAllRecords } from '../../action';
import CrmTable from '../table';
import history from '../../../../history';
import { ACCESS_LEVELS, CONTACT_RELATIONS, CRM_PERMISSIONS, MODULES, MODULE_ICONS, searchTypes } from '../../config';
import { toastr } from 'react-redux-toastr';
import Modal from '../../../../components/Modal';
import Create from '../create';
import Chats from '../../../chat-message/views/chats';
import { checkPermission } from '../../../../config/util';
import { CUSTOM } from '../../../../custom';
import CallLogs from '../../../../containers/views/Reports/CallLogs/table';
import { getCallDataReport, loadCallLogs } from '../../../../actions/reports';
import { CRM_DAYS_FIX_ASSIGNEE, CRM_FIELDS_PHONE, HOMEPAGE, LOCAL_PHONE_NUMBER_LENTGH } from '../../../../config/globals';
import { clearDataFromRedux } from '../../../../actions';
import Loader from '../../../../components/Loader';
import moment from 'moment';
import queryString from 'querystringify';
import Details from './Details';
import { getChatMessages } from '../../../chat-message/action';
import { index as listNotes } from '../../../disposition/action';
import DispositionTable from '../../../disposition/views/table';
import CallDetails from '../../../../containers/views/Reports/CallData/table';

const MODULE = "Contacts";

class DialFacility extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: null,
            loading: true,
            activeTab: "HelpDesk",
            searchType: Object.values(CUSTOM.CRM_SEARCH_OPTIONS || searchTypes)[0],
            messages: "",
            hasCallLogsAccess: false,
            hasMessageAccess: false,
            searchResults: [],
            editable: {},
            deletable: {},
            readable: {},
            callLogsLoaded: false,
            hasDispositionReadAccess: false,
            disposition_notes: [],
            filteredNotes: [],
            inboundChecked: true,
            outboundChecked: true
        };
    }

    componentWillMount() {
        if (checkPermission('Call Logs Management', 'READ')) {
            this.setState({ hasCallLogsAccess: true });
        }

        if (checkPermission('Unified Messaging', 'READ')) {
            this.setState({ hasMessageAccess: true });
        }

        this.setState({ hasDispositionReadAccess: checkPermission('Disposition Management', 'READ') });

        const editable = {};
        const deletable = {};
        const readable = {};
        Object.keys(MODULES).forEach((module) => {
            const perm = CRM_PERMISSIONS[module];
            editable[module] = checkPermission(perm, ACCESS_LEVELS.EDIT);
            deletable[module] = checkPermission(perm, ACCESS_LEVELS.DELETE);
            readable[module] = checkPermission(perm, ACCESS_LEVELS.VIEW);
        });

        this.setState({
            deletable,
            editable,
            readable
        })
    }

    componentDidMount() {
        (Object.keys(CUSTOM.CRM_MODULES || MODULES)).map((module) => {
            this.props.getFieldView(module);
            this.props.getModuleDescription(module);
        })

        if (this.props.match.params.id) {
            this.setState({ id: this.props.match.params.id });
            this.getContact(this.props.match.params.id);

            (CUSTOM.CRM_CONTACT_RELATIONS || ["HelpDesk", "ModComments"]).forEach((a) => {
                if (CONTACT_RELATIONS[a]) {
                    this.props.searchRecords(a, `${CONTACT_RELATIONS[a]} = ${this.props.match.params.id}`, ()=>{}, false, "", 0, 1000);
                }
            })

        } else {
            const { search, searchBy } = queryString.parse(this.props.location.search);
            if (search && searchBy) {
                this.setState({ query: search, searchType: _.find(Object.values(searchTypes), { value: searchBy }) }, () => {
                    this.search();
                });
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.id && this.props.match.params.id !== this.state.id && !this.state.searchResults) {
            this.setState({ id: this.props.match.params.id });
            this.getContact(this.props.match.params.id);
        }
        if (
            this.state.activeTab === "CallLogs" &&
            !this.state.callLogsLoaded &&
           this.props.contact
        ) {
            if (checkPermission('Call Logs Management', 'READ')) {
                // this.props.loadCallLogs({
                //     searchType: "phone",
                //     phone: [...new Set(CRM_FIELDS_PHONE.map((key) => this.props.contact[key]).filter((a => a)))]
                // });
                // console.log(this.props.call_data.length==0);
                let phone = [...new Set(CRM_FIELDS_PHONE.map((key) => {
                    const phoneNumber = this.props.contact[key];
                    return typeof phoneNumber === 'string' && phoneNumber.length >= LOCAL_PHONE_NUMBER_LENTGH ? phoneNumber.substring(phoneNumber.length - LOCAL_PHONE_NUMBER_LENTGH) : phoneNumber;
                }).filter((a => a)))].join(" ");

                if(this.props.call_data.length==0 && phone){
                    
                   
                    this.props.getCallDataReport(
                        {
                            queue: null,
                            startDate: null,
                            endDate: null,
                            extension: null,
                            number: phone,
                            campaign_id: null,
                            hotline: null
                        },
                        () => {} // Pass an empty function or the intended callback function
                    );
                }                    
                
                this.setState({ callLogsLoaded: true});
                
            }
        }

        if (JSON.stringify(prevProps.contact) !== JSON.stringify(this.props.contact)) {
            let activeTab = "HelpDesk";

            if (this.props.field_list && this.props.field_list.length > 1) {
                activeTab = "Details";
            }

            this.setState({ activeTab });
        }

        if (this.props.contact && JSON.stringify(prevProps.contact) !== JSON.stringify(this.props.contact)) {
            if (!this.props.chat_messages || this.props.chat_messages.length === 0) {
                this.props.getChatMessages([this.props.contact.mobile, this.props.contact.email]);
            }
            let num = [...new Set(CRM_FIELDS_PHONE.map((key) => {
                const phoneNumber = this.props.contact[key];
                return typeof phoneNumber === 'string' && phoneNumber.length >= LOCAL_PHONE_NUMBER_LENTGH ? phoneNumber.substring(phoneNumber.length - LOCAL_PHONE_NUMBER_LENTGH) : phoneNumber;
            }).filter((a => a)))];
            // console.log(num)
            if (num.length != 0) {
                this.props.listNotes({
                    number: num,
                }, (success) => {
                    console.log(this.props.disposition_notes)
                    this.setState({ disposition_notes: this.props.disposition_notes })
                });
            }

        }

    }

    componentWillUnmount() {
        this.props.getChatMessages([""]);

        this.props.getCallDataReport(
            {
                queue: null,
                startDate: null,
                endDate: null,
                extension: null,
                number: "-0",
                campaign_id: null,
                hotline: null
            },
            () => {} // Pass an empty function or the intended callback function
        );
    }

    handleEditTicket(module, row) {
        this.setState({ module, selected: row, mode: "edit", showTicket: true });
    }

    handleViewTicket(module, row) {
        this.setState({ module, selected: row, mode: "view", showTicket: true });
    }

    deleteTicket(module, row) {
        if (window.confirm("Are you sure, you want to delete this record?")) {
            this.props.deleteRecord(module, row.id, `contact_id = '${this.props.match.params.id}'`);
        }
    }

    handleCheckboxChange = (event) => {
        const { filteredNotes, inboundChecked, outboundChecked, disposition_notes } = this.state;
        const { name, checked } = event.target;

        let updatedFilteredNotes = [];
 

        if (name === 'inbound') {
            updatedFilteredNotes = this.filterNotes(disposition_notes, 'inbound', checked, outboundChecked);
            this.setState({ inboundChecked: checked });
        } else if (name === 'outbound') {
            updatedFilteredNotes = this.filterNotes(disposition_notes, 'outbound', checked, inboundChecked);
            this.setState({ outboundChecked: checked });
        }

        this.setState({ filteredNotes: updatedFilteredNotes });
    }

    filterNotes = (notes, direction, checked, oppositeChecked) => {
        if (checked && !oppositeChecked) {
            return notes.filter(note => note.direction === direction);
        } else if (!checked && !oppositeChecked) {
            return [];
        } else if (checked && oppositeChecked) {
            return notes.filter(note => note.direction === 'inbound' || note.direction === 'outbound');
        } else if (oppositeChecked) {
            if (direction === 'inbound') {
                return notes.filter(note => note.direction === 'outbound');
            } else {
                return notes.filter(note => note.direction === 'inbound');
            }

        }
        return [];
    }

    getContact(id) {
        this.props.getRecord(MODULE, id, () => {
            this.setState({ loading: false });
        })
    }

    search() {
        this.setState({ searchResults: [], id: undefined, notFound: false })
        let filter = [
            {
                "field": this.state.searchType.value,
                "value": this.state.query
            }];

        if (this.state.searchType.value === "phone") {
            const phone_feilds = CRM_FIELDS_PHONE.map(a => `${a} LIKE '%${this.state.query.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH)}%'`);
            filter = phone_feilds.join(" OR ");
        }

        this.props.searchRecords(MODULE, filter, (err, data) => {
            if (data && data.length) {
                if (data.length > 1) {
                    this.setState({ searchResults: data, id: undefined })
                } else {
                    history.push(`/contacts/${data[0].id}`);
                }
            } else {
                if (this.state.searchType.value === "phone") {
                    const data = {};
                    CRM_FIELDS_PHONE.forEach(a => data[a] = this.state.query);
                    this.setState({ createData: data });
                }
                this.setState({ searchResults: [], id: undefined, notFound: true })
            }
        })
    }

    renderCustomTabs() {
        const items = []
        const { contact } = this.props;
        if (CUSTOM && CUSTOM.CONTACT_TABS) {
            for (let a in CUSTOM.CONTACT_TABS) {
                const action = CUSTOM.CONTACT_TABS[a];
                if (checkPermission(action.permission, 'READ')) {
                    const Table = require("../../../" + action.path).default;

                    items.push(<TabPane tabId={a}>
                        <Table contact={contact} />
                    </TabPane>);
                }
            }
        }
        return items;
    }

    renderCustomTabLinks() {
        const items = []

        if (CUSTOM && CUSTOM.CONTACT_TABS) {
            for (let a in CUSTOM.CONTACT_TABS) {
                const action = CUSTOM.CONTACT_TABS[a];
                if (checkPermission(action.permission, 'READ') && this.props[action.redux_state]) {
                    items.push(<NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === a })}
                            onClick={() => { this.setState({ activeTab: a }) }}
                        >
                            <i className={action.icon} /> {action.label} {" "}
                            <Badge color="danger">{this.props[action.redux_state].length}</Badge>
                        </NavLink>
                    </NavItem>);
                }
            }
        }
        return items;
    }

    render() {
        const { id, searchResults, notFound, createData, disposition_notes, filter, filteredNotes, inboundChecked, outboundChecked } = this.state;
        const { crm_records, contact, call_logs, chat_messages, call_data } = this.props;
        const { id: customer_id, assigned_user_id, ...crm_fields } = contact || {};
        // console.log("chat_messages",contact)
        let assignee;

        if (!this.props.field_list) {
            return <Loader />;
        }

        if (CRM_DAYS_FIX_ASSIGNEE) {
            if (crm_records["HelpDesk"]) {
                const recentTicket = _.find(crm_records["HelpDesk"], (a) => { return moment().diff(moment(a.createdtime), "days") <= parseInt(CRM_DAYS_FIX_ASSIGNEE) })
                if (recentTicket)
                    assignee = recentTicket.assigned_user_id;
            }
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a className="breadcrumb-item" href={`${HOMEPAGE}/crm/Contacts`}>Contacts</a></li>
                    <li className="breadcrumb-item active">Search</li>
                </ol>
                <div className="container-fluid mb-5">
                    <Row>
                        <Col md="12">
                            <Card>
                                <CardBody>
                                    <form onSubmit={(e) => { e.preventDefault(); this.search() }}>
                                        <div className="d-flex justify-content-between">
                                            <InputGroup className="flex-grow-1">
                                                <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.dropdownOpen} toggle={() => { this.setState({ dropdownOpen: !this.state.dropdownOpen }) }}>
                                                    <DropdownToggle style={{ width: 230 }} caret color="light">
                                                        {this.state.searchType.label}
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        {Object.values(CUSTOM.CRM_SEARCH_OPTIONS || searchTypes).map((a) => (<DropdownItem key={a.value} onClick={() => this.setState({ searchType: a })}>{a.label}</DropdownItem>))}
                                                    </DropdownMenu>
                                                </InputGroupButtonDropdown>
                                                <Input type="text" id="name" placeholder={`Enter a ${this.state.searchType.label}`} required value={this.state.query} onChange={(e) => this.setState({ query: e.target.value })} />
                                            </InputGroup>
                                            <Button type='submit' className="ml-3" style={{ width: 100 }} color="primary">Search</Button>
                                        </div>
                                    </form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    {
                        notFound ?
                            <Row>
                                <Col>
                                    <Card>
                                        <CardHeader>Create Contact</CardHeader>
                                        <CardBody>
                                            <Alert color='info'>No records found. Would you like to create a new contact?</Alert>
                                            <Create columns={3} onCancel={(data) => {
                                                if (!data) {
                                                    this.setState({ notFound: false })
                                                } else {
                                                    history.push(`/contacts/${data.id}`)
                                                }
                                            }} module={MODULES.Contacts} data={createData} mode="create" assignee={assignee} />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row> :
                            searchResults && searchResults.length > 0 ? <Row>
                                <Col>
                                    <Card>
                                        <CardHeader>
                                            Search Results
                                        </CardHeader>
                                        <CardBody>
                                            <div className='d-flex flex-column'>
                                                <div className='mb-2'>
                                                    <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a>
                                                </div>
                                                <CrmTable
                                                    onEditRow={(e) => this.handleEditTicket(MODULES.Contacts, e)}
                                                    onViewRow={(e) => history.push(`/contacts/${e.id}`, e)}
                                                    onDeleteRow={(e) => this.deleteTicket(MODULES.Contacts, e)}
                                                    showLegend={this.state.showLegend}
                                                    module={MODULES.Contacts}
                                                    hideDescription={true}
                                                />
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                                : id ?
                                    <Row>
                                        <Col>
                                            <Card>
                                                <CardBody>
                                                    {_.isEmpty(contact) ? <Loader /> :
                                                        <Profile contact={contact} onNewTicket={(module) => this.setState({ showTicket: true, selected: null, mode: "create", module })} />
                                                    }
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row> : ""}
                    {id ?
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody className="p-1 bg-light">
                                        <Nav tabs>
                                            {
                                                this.props.field_list.length > 1 ?
                                                    <NavItem>
                                                        <NavLink
                                                            className={classnames({ active: this.state.activeTab === 'Details' })}
                                                            onClick={() => { this.setState({ activeTab: 'Details' }) }}
                                                        >
                                                            <i className='fa fa-address-card-o' /> {"Details "}
                                                        </NavLink>
                                                    </NavItem> : ""
                                            }
                                             {
                                                this.state.hasCallLogsAccess ?
                                                    <NavItem>
                                                        <NavLink
                                                            className={classnames({ active: this.state.activeTab === 'CallLogs' })}
                                                            onClick={() => { this.setState({ activeTab: 'CallLogs' }) }}
                                                        >
                                                            <i className='fa fa-file-text-o' /> {"CallLogs "}
                                                            {call_data ? <Badge color="danger">{call_data.length}</Badge> : ""}
                                                        </NavLink>
                                                    </NavItem> : ""
                                                   }
                                            {(CUSTOM.CRM_CONTACT_RELATIONS || ["HelpDesk", "ModComments"]).map((module) => this.state.readable[module] && CONTACT_RELATIONS[module] ? <NavItem>
                                                <NavLink
                                                    className={classnames({ active: this.state.activeTab === module })}
                                                    onClick={() => { this.setState({ activeTab: module }) }}
                                                >
                                                    <i className={`fa ${MODULE_ICONS[module]}`} /> {((CUSTOM.CRM_MODULES && CUSTOM.CRM_MODULES[module]) || MODULES[module])} {" "}
                                                    {crm_records && crm_records[module] ? <Badge color="danger">{crm_records[module].length}</Badge> : ""}
                                                </NavLink>
                                            </NavItem> : "")}
                                            {this.renderCustomTabLinks()}
                                            {this.state.hasMessageAccess && chat_messages ?
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === 'messages' })}
                                                        onClick={() => { this.setState({ activeTab: 'messages' }) }}
                                                    >
                                                        <i className='fa fa-inbox' /> {"Messages "}
                                                        <Badge color="danger">{chat_messages.length}</Badge>
                                                    </NavLink>
                                                </NavItem> : ""}

                                            {this.state.hasDispositionReadAccess ?
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === 'disposition' })}
                                                        onClick={() => { this.setState({ activeTab: 'disposition' }) }}
                                                    >
                                                        <i className='fa fa-inbox' /> {"Disposition Notes "}
                                                        <Badge color="danger">{disposition_notes && disposition_notes.length}</Badge>
                                                    </NavLink>
                                                </NavItem> : ""}
                                        </Nav>
                                        <TabContent activeTab={this.state.activeTab}>
                                            <TabPane tabId={"Details"}>
                                                <Details contact={contact} />
                                            </TabPane>
                                            {(CUSTOM.CRM_CONTACT_RELATIONS || ["HelpDesk", "ModComments"]).map((module) => this.state.readable[module] ? <TabPane tabId={module}>
                                                <div className='d-flex flex-column'>
                                                    <div className='mb-2'>
                                                        <a className="float-right btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a>
                                                    </div>
                                                    <CrmTable
                                                        onEditRow={(e) => this.handleEditTicket(module, e)}
                                                        onViewRow={(e) => this.handleViewTicket(module, e)}
                                                        onDeleteRow={(e) => this.deleteTicket(module, e)}
                                                        showLegend={this.state.showLegend}
                                                        editable={this.state.editable[module]}
                                                        deletable={this.state.deletable[module]}
                                                        module={module}
                                                        hideDescription={module !== "HelpDesk"}
                                                        parent_module={MODULES.Contacts}
                                                    />
                                                </div>
                                            </TabPane> : "")}
                                            {this.state.hasCallLogsAccess ?
                                                <TabPane tabId="CallLogs">
                                                    <Row>
                                                        <Col sm="12">
                                                            {/* <CallLogs call_logs={this.props.call_logs} /> */}
                                                            <CallDetails data={call_data}/>
                                                        </Col>
                                                    </Row>
                                                </TabPane> : ""}
                                            {this.renderCustomTabs()}
                                            <TabPane tabId="messages">
                                                <Row>
                                                    <Col sm="12">
                                                        {chat_messages && chat_messages.length > 0 ?
                                                            <Chats chats={chat_messages} />
                                                            : "No data available to display"}

                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane tabId="disposition">
                                                <Row className="mb-3 px-4">
                                                    <FormGroup check className="mr-2" inline>
                                                        <Label check>
                                                            {' '}
                                                            <Input type="checkbox" name="inbound" checked={inboundChecked} onChange={this.handleCheckboxChange} />{' '}
                                                            Inbound
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Label check>
                                                            <Input type="checkbox" name="outbound" checked={outboundChecked} onChange={this.handleCheckboxChange} />{' '}
                                                            Outbound
                                                        </Label>
                                                    </FormGroup>
                                                </Row>
                                                <Row>
                                                    {disposition_notes.length !== 0 ?
                                                        <Card className="flex-grow-1">
                                                            <CardBody>
                                                                <DispositionTable data={inboundChecked && outboundChecked ? disposition_notes : filteredNotes} />
                                                            </CardBody>
                                                        </Card> :
                                                        <div className="mx-3">No data available</div>
                                                    }
                                                </Row>
                                            </TabPane>
                                        </TabContent>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row> : ""}
                </div>
                <Modal size="lg" title={(CUSTOM.CRM_MODULES || MODULES)[this.state.module]} toggle={() => { this.setState({ showTicket: !this.state.showTicket }) }} isOpen={this.state.showTicket}>
                    <Create columns={3} onCancel={(a) => this.setState({ showTicket: false, activeTab: this.state.module })} module={this.state.module} profile={this.state.id} data={this.state.selected ? this.state.selected : { ...crm_fields, contact_id: this.state.id, customer: this.state.id }} mode={this.state.mode} assignee={assignee} />
                </Modal>
            </div>
        );
    }
}

function mapStateToProps(states) {
    const { field_list, crm_records_page, crm_record, call_logs, chat_messages, disposition_notes, call_data } = states;
    const all_data = {};
    if (CUSTOM && CUSTOM.CONTACT_TABS) {
        Object.values(CUSTOM.CONTACT_TABS).forEach((a) => {
            all_data[a.redux_state] = states[a.redux_state];
        })
    }

    return {
        field_list: field_list[MODULE],
        contact: crm_record[MODULE],
        crm_records: crm_records_page,
        ...all_data,
        call_logs,
        chat_messages: chat_messages,
        disposition_notes: disposition_notes,
        call_data
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getRecord,
        getFieldView,
        getModuleDescription,
        deleteRecord,
        getAllRecords,
        searchRecords,
        loadCallLogs,
        clearDataFromRedux,
        getChatMessages,
        listNotes,
        getCallDataReport
    }, dispatch);
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(DialFacility);
