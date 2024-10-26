import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { getStatus, logout, setStatus, getAgentPhoneStatus } from '../../actions/index';
import ProfileSettings from '../views/Users/ProfileSettings';
import history from '../../history';
import { loadAgentActivities } from '../../actions/reports';
import { AGENT_STATUS_REFRESH, LOGIN_METHODS, PHONE_STATUS_REFRESH } from '../../config/globals';
import ChangePassword from '../../modules/password-login/views/ChangePassword';

class UserMenu extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            dropdownOpen: false,
            statusDropDown: {},
            modal: false,
            changepwd: false,
            loggeduser: ''
        };

        this.toggleModel = this.toggleModel.bind(this);
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    toggleStatusDropDown(id) {
        this.setState({
            statusDropDown: { ...this.state.statusDropDown, [id]: !this.state.statusDropDown[id] },
        });
    }

    toggleModel() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    togglePwd() {
        this.setState({
            changepwd: !this.state.changepwd,
        });
    }

    componentWillMount() {
        this.props.loadAgentActivities();
        if (JSON.parse(localStorage.getItem('lbcc_user'))) {

            this.setState({
                loggeduser: JSON.parse(localStorage.getItem('lbcc_user')).login_username
            });
        }




        this.props.getStatus();
        this.props.getAgentPhoneStatus();

        this.refreshIntervalPhone = window.setInterval(() => {
            this.props.getAgentPhoneStatus();
        }, PHONE_STATUS_REFRESH * 1000);

        this.refreshIntervalAgentStatus = window.setInterval(() => {
            this.props.getStatus();
        }, AGENT_STATUS_REFRESH * 1000)
    }

    componentWillUnmount() {
        window.clearInterval(this.refreshIntervalPhone);
        window.clearInterval(this.refreshIntervalAgentStatus);
    }

    logout() {
        this.props.logout(() => {
            history.push("/");
        })
    }

    setStatus(status, subStatus) {
        this.props.setStatus(status, subStatus, () => {
            if (status === 3) {
                this.logout();
            }
        });
    }

    render() {
        const { user, agent_activities, user_status } = this.props;
        return (
            <div className='d-flex ml-3' style={{ height: 21, marginLeft: 10 }}>
                {user.user_details.ringmymobile ? <span title='Mobile forward enabled' className={`user-status bg-primary text-center mr-1`}><i className={`fa fa-mobile`}></i></span> : ""}
                {user_status ? user_status.qstatus == 1 && user_status.status_id == 1 ? <span title='Queue Logged In' className={`user-status bg-primary text-center mr-1`}><i className={`fa fa-sign-in`}></i></span> : "" : ""}
                <Dropdown nav isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
                    <DropdownToggle nav>
                        {this.state.loggeduser ? (<span className='d-flex'><span title={user_status ? user_status.status_name : "Checking the status"} className={`user-status bg-${user_status && agent_activities && agent_activities.length > 0 ? _.find(agent_activities, { id: user_status.status_id }).color_desc : "info"} `}><i className={`fa fa-user`}></i></span><div className='ml-2'>{user.user_details.first_name ? user.user_details.first_name : "" + ' ' + user.user_details.last_name ? user.user_details.last_name : ""}</div></span>) : (<span className="text-avatar bg-info">A</span>)}
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-lg" right>
                        <DropdownItem onClick={() => { this.setState({ modal: true }) }}><i className="fa fa-user"></i>Profile Settings</DropdownItem>
                        {LOGIN_METHODS.indexOf("Password") > -1 ? <DropdownItem onClick={() => { this.setState({ changepwd: true }) }}><i className="fa fa-key"></i>Change Password</DropdownItem> : ""}
                        {
                            this.props.phone_status /* && (this.props.phone_status.status !== "oncall" && this.props.phone_status.status !== "aftercall")*/ ?
                                <div>
                                    <DropdownItem divider />
                                    <DropdownItem header>Change Status</DropdownItem>
                                    {
                                        agent_activities.sort((a, b) => {
                                            if (a.id === 3) return 1;
                                            if (b.id === 3) return -1;
                                            return 0;
                                        }).map((a) => {
                                            if ((user_status && a.id !== 2 && a.id !== user_status.status_id) || a.id === 3) {
                                                if (a.sub_status_list && a.sub_status_list.length) {
                                                    return <ul className="sub-menu" key={a.id}><Dropdown key={a.id} nav isOpen={this.state.statusDropDown[a.id]} toggle={() => this.toggleStatusDropDown(a.id)}>
                                                        <DropdownToggle nav>
                                                            <DropdownItem key={a.id} className={`bg-${a.color_desc}`} ><i className={`fa fa-user text-${a.color_desc}`}></i> {a.id === 3 ? "Logout" : _.capitalize(a.status_name.toLowerCase())}
                                                            </DropdownItem>
                                                        </DropdownToggle>
                                                        <DropdownMenu right>
                                                            {
                                                                a.sub_status_list.map((b, index) => {
                                                                    return <DropdownItem key={index} className={`bg-${a.color_desc}`} onClick={() => this.setStatus(a.id, b.sub_id)}>{_.capitalize(b.sub_status_name.toLowerCase())}</DropdownItem>
                                                                })
                                                            }
                                                        </DropdownMenu>
                                                    </Dropdown></ul>
                                                }
                                                else {
                                                    return <DropdownItem key={a.id} className={`bg-${a.color_desc}`} onClick={() => this.setStatus(a.id, 0)}><i className={`fa fa-user text-${a.color_desc}`}></i> {a.id === 3 ? "Logout" : _.capitalize(a.status_name.toLowerCase())}</DropdownItem>
                                                }
                                            } else
                                                return ""
                                        })
                                    }
                                </div> : ""
                        }

                        {/* <DropdownItem divider />
                        <DropdownItem onClick={() => this.logout()}><i className="fa fa-sign-out"></i> Logout</DropdownItem> */}
                    </DropdownMenu>
                </Dropdown>
                <ProfileSettings isOpen={this.state.modal} toggle={this.toggleModel} />
                <ChangePassword isOpen={this.state.changepwd} toggle={() => this.togglePwd()} />
            </div>

        );
    }
}

function mapStateToProps({ user, agent_activities, phone_status, user_status }) {
    return {
        user,
        agent_activities,
        phone_status,
        user_status
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        logout,
        loadAgentActivities,
        getAgentPhoneStatus,
        setStatus,
        getStatus
    }, dispatch);
}


export default (connect(mapStateToProps, mapDispatchToProps)(UserMenu));
