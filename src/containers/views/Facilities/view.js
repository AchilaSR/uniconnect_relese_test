
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import {
    Card, CardBody, Row, Col, Input, Button, InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Alert,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Badge
} from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import { loadCampaignField as loadCustomFields } from '../../../modules/field-layout/action';
import _ from 'lodash';
import queryString from 'querystringify';
import { searchCustomer, autoDialCustomer, getNextFacility, followUp, loadFollowUpMetaData, clearCurrentFacility } from '../../../actions/facilities';
import { getAgentConfig, getGroupConfig } from '../../../actions/users';
import Profile from './MainProfile';
import { searchTypes } from '../../../actions/config';
import { HOMEPAGE, LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';
import DispostionHistory from './disposition_history';
import { changeOutboundMode, checkAutoDialMode } from '../../../actions';
import classnames from 'classnames';
import { getChatMessages } from '../../../modules/chat-message/action';
import Chats from '../../../modules/chat-message/views/chats';
import { checkPermission } from '../../../config/util';
class DialFacility extends Component {

    constructor(props) {
        super(props);

        this.state = {
            search: undefined,
            searching: false,
            forceSearch: true,
            searchBy: undefined,
            clickedNext: false,
            activeTab: 'own',
            dropdownOpen: false,
            searchType: searchTypes.PHONE_NUMBER,
            query: "",
            dispositionAdded: false,
            activeTab2: "disposition",
            hasMessageAccess: false
        };
    }

    componentWillMount() {
        this.props.getAgentConfig();
        this.props.getGroupConfig();
    }

    componentDidMount() {
        this.props.changeOutboundMode("1");
        this.init();
        this.loadCustomer = setInterval(() => {
            if (!this.props.facility || !this.props.facility.id) {
                this.setState({ forceSearch: true });
            }
        }, 5000);

        if (checkPermission("Unified Messaging")) {
            this.setState({ hasMessageAccess: true })
        }
    }

    componentDidUpdate(prevProps) {

        if (this.props.facility && ((prevProps.facility && prevProps.facility.id !== this.props.facility.id) || !prevProps.facility)) {
            this.props.loadCustomFields(this.props.facility.campaign_id);
            this.setState({ dispositionAdded: false });
        }

        if (!this.props.facility || !this.props.facility.id) {
            //user status changed to available from some other status
            if (prevProps.user_status && this.props.user_status && prevProps.user_status.status_id !== this.props.user_status.status_id && this.props.user_status.status_id === 1) {
                this.init();
            }

            //phone status returned a different customer number
            if (this.props.phone_status && this.props.phone_status.customer_number && (!prevProps.phone_status || this.props.phone_status.customer_number !== prevProps.phone_status.customer_number)) {
                this.init();
            }

            if (prevProps.location.search !== this.props.location.search) {
                this.init();
            }

            if (this.state.forceSearch) {
                this.init();
            }
        } else {
            if (this.state.dispositionAdded && prevProps.phone_status && prevProps.phone_status.customer_number && this.props.phone_status && prevProps.phone_status.customer_number !== this.props.phone_status.customer_number) {
                this.clearCurrentFacility();
            }
        }

        if (this.props.facility && this.state.hasMessageAccess) {
            if (!this.props.chat_messages || this.props.chat_messages.length === 0) {
                this.props.getChatMessages([this.props.facility.cf_email, this.props.facility.number]);
            }
        }
    }

    init() {
        const { search, searchBy } = queryString.parse(this.props.location.search);
        if (!this.state.searching) {
            // this.setState({ searching: true }, () => {
            if (search) {
                console.log("[PF] searching for " + search);
                this.setState({ searching: `Searching for the lead with ${searchBy} ${search}` });
                this.setState({ search, query: search, searchType: searchBy || searchTypes.PHONE_NUMBER, searchBy }, function () {
                    this.props.searchCustomer(this.state.search, this.state.searchBy, () => {
                        this.setState({ searching: false, forceSearch: false });
                    });
                });
            } else if (this.props.phone_status && this.props.phone_status.customer_number) {
                console.log("[PF] get handling lead - number " + JSON.stringify(this.props.phone_status));
                this.setState({ searching: `Loading the lead that's being handled right now...` });
                this.props.autoDialCustomer(() => {
                    this.setState({ searching: false, forceSearch: false });
                });
            } else {
                console.log("[PF] get next lead");
                this.setState({ searching: `Getting ready to dial the next lead...` });
                this.getNextFacility();
            }
            // });
        }
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            }, function () {
                this.loadFacility();
            });
        }
    }

    handleReminderDateChange(date) {
        this.setState({
            reminderDate: date
        });
    }

    componentWillUnmount() {
        this.props.changeOutboundMode("0");
        this.props.clearCurrentFacility();
        this.props.getChatMessages([""]);
        clearInterval(this.loadCustomer);
    }

    clearCurrentFacility() {
        this.setState({ search: undefined }, () => {
            this.props.clearCurrentFacility();

            this.props.history.push({
                pathname: "/leads/dial",
                search: ""
            });
            console.log("[PF] Cleared current facility");
        });
    }

    searchCustomer() {
        if (!this.state.query) {
            alert("Please enter a Customer Number to search");
            return;
        } else {
            this.props.clearCurrentFacility();
            this.props.history.push({
                pathname: "/leads/dial",
                search: `?search=${this.state.query}&searchBy=${this.state.searchType}&clickedSearch=true`
            });
        }
    }

    getNextFacility() {
        const self = this;
        self.props.getNextFacility(function (search) {
            self.setState({ searching: false, forceSearch: false });
            if (search) {
                self.props.history.push({
                    pathname: "/leads/dial",
                    search: `?search=${search}&searchBy=${searchTypes.LEAD_ID}&clickedNext=true`
                });
            }
        });
    }

    onDispositionAdded() {
        this.setState({ dispositionAdded: true });
        if (this.props.phone_status && ["oncall", "ringing", "dialing"].indexOf(this.props.phone_status.status) > -1 && this.props.phone_status.customer_number && this.props.phone_status.customer_number.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH) === this.props.facility.number.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH)) {
            if (this.state.search) {
                this.props.searchCustomer(this.state.search, this.state.searchBy);
            }
        } else {
            this.clearCurrentFacility();
        }
    }


    render() {
        const { facility, next_customer, chat_messages } = this.props;

        if (next_customer && facility) {
            if (next_customer.customer_id === facility.customer_number) {
                mainContract = next_customer.contract_number;
            }
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a className="breadcrumb-item" href={`${HOMEPAGE}/campaigns`}>Leads</a></li>
                    <li className="breadcrumb-item active">Search</li>
                </ol>
                <div className="container-fluid mb-5">
                    <Row>
                        <Col md="12">
                            <Card>
                                <CardBody>
                                    <div className="d-flex justify-content-between">
                                        <InputGroup className="flex-grow-1">
                                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.dropdownOpen} toggle={() => { this.setState({ dropdownOpen: !this.state.dropdownOpen }) }}>
                                                <DropdownToggle style={{ width: 230 }} caret color="light">
                                                    {this.state.searchType}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {Object.values(searchTypes).map((a) => (<DropdownItem key={a} onClick={() => this.setState({ searchType: a })}>{a}</DropdownItem>))}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                            <Input type="text" id="name" placeholder={`Enter a ${this.state.searchType}`} required value={this.state.query} onChange={(e) => this.setState({ query: e.target.value })} />
                                        </InputGroup>
                                        <Button className="ml-3" style={{ width: 100 }} onClick={() => { this.searchCustomer() }} color="primary">Search</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    {_.isEmpty(facility) ? this.state.searching && !this.state.forceSearch ? <Alert color='info'>{this.state.searching}</Alert> : <Alert color='danger'>No data available to display</Alert> :
                        <div>
                            <Card>
                                <CardBody>
                                    <Profile onDispositionAdded={() => this.onDispositionAdded()} refresh={() => { }} disableDisposition={this.state.dispositionAdded || !this.props.phone_status || (this.props.phone_status.status !== "idle" && !this.props.phone_status.customer_number)} facility={facility} />
                                </CardBody>
                            </Card>
                            {/* {facility.disposition_history && facility.disposition_history.length ?
                                <Card>
                                    <CardHeader>Disposition History</CardHeader>
                                    <CardBody>
                                        <DispostionHistory data={facility.disposition_history} />
                                    </CardBody>
                                </Card> : ""} */}
                            <Card>
                                <CardBody>
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab2 === 'disposition' })}
                                                onClick={() => { this.setState({ activeTab2: 'disposition' }) }}
                                            >
                                                <i className='fa fa-file-text-o' /> {"Disposition History "}
                                                <Badge color="danger">{facility.disposition_history.length}</Badge>
                                            </NavLink>
                                        </NavItem>
                                        {this.state.hasMessageAccess ? <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab2 === 'sms' })}
                                                onClick={() => { this.setState({ activeTab2: 'sms' }) }}
                                            >
                                                <i className='fa fa-inbox' /> {"Messages "}
                                                <Badge color="danger">{chat_messages ? chat_messages.length : 0}</Badge>
                                            </NavLink>
                                        </NavItem> : ""}
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab2}>
                                        <TabPane tabId="disposition">
                                            {facility.disposition_history && facility.disposition_history.length ?
                                                <DispostionHistory data={facility.disposition_history} />
                                                : "No data available to display"}
                                        </TabPane>
                                        <TabPane TabPane tabId="sms">
                                            {chat_messages && chat_messages.length > 0 ? <Chats chats={chat_messages} />
                                                : "No data available to display"}
                                        </TabPane>
                                    </TabContent>
                                </CardBody>
                            </Card>

                        </div>
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps({ facility, metadata, user, next_customer, user_status, phone_status, chat_messages }) {
    return {
        facility,
        metadata,
        user,
        next_customer,
        user_status,
        phone_status,
        chat_messages
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchCustomer,
        getNextFacility,
        loadFollowUpMetaData,
        followUp,
        getAgentConfig,
        getGroupConfig,
        loadCustomFields,
        autoDialCustomer,
        clearCurrentFacility,
        checkAutoDialMode,
        changeOutboundMode,
        getChatMessages
    }, dispatch);
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(DialFacility);
