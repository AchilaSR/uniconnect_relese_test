import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Nav, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import { getAgentMonitorData, getAgentStatusRequestsList } from '../actions/reports';
import { getOutboundIDList } from '../actions/users';
import logo from '../theme/logo.png';
import UserMenu from './menus/UserMenu';
import { loadFollowUps } from '../actions/facilities';
import { checkPermission } from '../config/util';
import { HIDE_AGENT_STATUS_BAR, NOTIFICATION_REFRESH_INTERVAL } from '../config/globals';
import text from '../theme/texts.json';
import { CUSTOM } from '../custom';
import PhoneStatus from '../modules/disposition/views/PhoneStatus';
import PersonalStats from '../modules/personal-stats/views';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      asideContent: "",
      showBreakPanel: false,
      followupAccess: false,
      showPersonalStats: false
    }
  }

  componentWillMount() {
    this.setState({ followupAccess: checkPermission('Followups Management', 'READ') });
    this.setState({ showBreakPanel: checkPermission('Break Approval', 'READ') });
    this.props.getOutboundIDList();
  }

  componentDidMount() {
    if (this.state.followupAccess && !CUSTOM.NOTIFICATION_PANEL) {
      this.props.loadFollowUps();

      this.followupIntval = setInterval(() => {
        this.props.loadFollowUps();
      }, NOTIFICATION_REFRESH_INTERVAL * 1000);
    }

    if (this.state.showBreakPanel) {
      this.props.getAgentStatusRequestsList();

      this.breakIntval = setInterval(() => {
        this.props.getAgentStatusRequestsList();
      }, NOTIFICATION_REFRESH_INTERVAL * 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.followupIntval);
    clearInterval(this.breakIntval);
  }

  followupSidebarTogglerClick(e) {
    this.toggleAsideMenu("followup");
  }


  breakSidebarTogglerClick(e) {
    this.toggleAsideMenu("break");
  }

  showPersonalStats() {
    this.setState({
      showPersonalStats: true
    })

    setTimeout(() => {
      this.setState({
        showPersonalStats: false
      })
    }, 15000)
  }

  toggleAsideMenu(content) {
    const asideOpened = document.body.classList.contains('aside-menu-lg-show');
    this.props.onAsideMenuClicked(content);
    this.setState({ asideContent: content });

    if (this.state.asideContent === content && asideOpened) {
      document.body.classList.remove('aside-menu-lg-show');
    } else {
      document.body.classList.add('aside-menu-lg-show');
    }
  }

  render() {
    const { followups, agent_status_changes } = this.props;
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        {this.props.showMenu ? <AppSidebarToggler className="d-md-down-none" display="lg" /> : <div className='p-2 bg-primary'><div className='bg-white border rounded px-3 py-1'><img alt="Logo" style={{ height: 30 }} src={logo} /></div></div>}
        <AppNavbarBrand style={{ width: 200 }}>{text.title || "UniConnect™"}</AppNavbarBrand>
        <Nav className="ml-auto px-3 d-shrink-0" navbar>
          <div className='ml-3'><PhoneStatus /></div>
          <div className='phone-status-container ml-3' style={{ overflow: "hidden" }}>
            {HIDE_AGENT_STATUS_BAR ? "" :
              this.state.showPersonalStats ?
                <PersonalStats /> :
                <Button onClick={() => this.showPersonalStats()} className="d-md-down-none remiderButton" ><i className="fa fa-bar-chart" ></i></Button>}
          </div>
          {this.state.showBreakPanel ?
            <Button onClick={this.breakSidebarTogglerClick.bind(this)} className="ml-3 d-md-down-none remiderButton" ><i className="fa fa-coffee" ></i>{agent_status_changes ? <span className="count">{agent_status_changes.length}</span> : ""}</Button> : ""}
          {this.state.followupAccess || CUSTOM.NOTIFICATION_PANEL ?
            <Button onClick={this.followupSidebarTogglerClick.bind(this)} className="ml-3 d-md-down-none remiderButton" ><i className="fa fa-bell" ></i><span className="count">{followups.length}</span></Button> : ""}
          <UserMenu />
        </Nav>
      </React.Fragment>
    );
  }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;


function mapStateToProps({ agent_status_changes, agent_monitor_data, followups }) {
  return {
    agent_status_changes,
    agent_monitor_data,
    followups
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadFollowUps,
    getAgentMonitorData,
    getAgentStatusRequestsList,
    getOutboundIDList
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
