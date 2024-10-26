import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { connect } from 'react-redux';
import { Container, Alert } from 'reactstrap';
import logo from '../theme/logo.png';
import { DISABLE_FEATURES, DISPLAY_TRIAL_WARNING, HOMEPAGE, LICENSE_EXPIRY_DATE, LICENSE_EXPIRY_WARNING_INTERVAL_MINS, PASSWORD_EXPIRE_WARNING_DAYS } from '../config/globals';
import { findDeep } from '../config/util';

import {
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarHeader,
  AppSidebarNav,
  AppAside
} from '@coreui/react';

import Footer from './Footer';
import Header from './Header';
import ActivityNotifications from './views/Reports/ActivityMonitor/notification';
import routes from '../config/routes';
import navigation from '../config/navigation';
import Reminders from './views/FollowUps/reminders';
import { CUSTOM } from '../custom';
import history from '../history';
import moment from 'moment';
import PopupModal from '../components/Modal';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      asideContent: "followup",
      showLicenseWarning: false,
      disableFeatures: false
    }
  }

  componentDidMount() {
    this.setState({ showLicenseWarning: DISPLAY_TRIAL_WARNING, disableFeatures: DISABLE_FEATURES });

    this.licenseInterval = setInterval(() => {
      this.setState({ showLicenseWarning: DISPLAY_TRIAL_WARNING, disableFeatures: DISABLE_FEATURES });
    }, LICENSE_EXPIRY_WARNING_INTERVAL_MINS * 60 * 1000)
  }

  renderNotificationPanel() {
    if (CUSTOM.NOTIFICATION_PANEL) {
      const Table = require("../modules" + CUSTOM.NOTIFICATION_PANEL).default;
      return <Table />
    } else {
      return <Reminders />
    }
  }
  render() {
    let menu = navigation.getItems();

    let homepage;

    if (HOMEPAGE && findDeep(menu, { url: HOMEPAGE })) {
      homepage = HOMEPAGE;
    } else {
      homepage = menu.items[0].url || menu.items[0].children[0].url;
    }

    if (!menu.items.length) {
      history.push("/login")
    }

    if (menu.items.length === 1 && menu.items[0].children) {
      menu.items = menu.items[0].children;
    }


    const renderPasswordWarning = () => {
      if (PASSWORD_EXPIRE_WARNING_DAYS > 0) {
        if (!this.props.user.last_password_update_time) {
          return <Alert className='mb-0' color="danger"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i> To adhere to the password policy, kindly change your password.</Alert>
        } else {
          const passwordExpiresIn = moment().diff(moment(this.props.user.last_password_update_time), 'd');
          if (passwordExpiresIn > PASSWORD_EXPIRE_WARNING_DAYS)
            return <Alert className='mb-0' color="danger"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i> It's almost time for your password to expire. Please change it to prevent the account from being locked.</Alert>
        }
      }
    }

    const { dispatch, ...sideBarProps } = this.props;
    return (
      <div className="app">
        <AppHeader fixed>
          <Header onAsideMenuClicked={(content) => this.setState({ asideContent: content })} asideContent={this.state.asideContent} showMenu={menu.items.length > 1} />
        </AppHeader>
        <div className="app-body">
          {menu.items.length > 1 ?
            <AppSidebar className="bg-primary pb-3" fixed display="lg">
              <AppSidebarHeader />
              <div className="py-5 text-center">
                <div className="bg-white p-3 rounded" style={{ display: "inline-block" }}>
                  <img alt="Logo" style={{ width: 120 }} src={logo} />
                </div>
              </div>
              <AppSidebarNav navConfig={menu} {...sideBarProps} />
            </AppSidebar>
            : ""}
          <main className="main">
            {renderPasswordWarning()}
            <Container fluid className="px-0">
              <Switch>
                <Redirect exact from="/" to={homepage} />
                {routes.map((route, idx) => {
                  return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
                    <route.component {...props} />
                  )} />)
                    : (null);
                },
                )}
              </Switch>
            </Container>
          </main>
          <AppAside fixed>
            {this.state.asideContent === 'followup' ? this.renderNotificationPanel() : <ActivityNotifications />}
          </AppAside>
        </div>
        <AppFooter>
          <Footer />
        </AppFooter>
        <PopupModal hideCloseButton={this.state.disableFeatures} toggle={() => { this.setState({ showLicenseWarning: !this.state.showLicenseWarning }) }} size="lg" title="Warning!" isOpen={this.state.showLicenseWarning}>
          <p>
            <h1 className='text-danger'>Your trial license for 3CX is valid until {LICENSE_EXPIRY_DATE}.</h1>

            Upon expiration:
            <ul>
              <li>The system may be stopped.</li>
              <li>Access to features may be restricted.</li>
              <li>Saving/exporting data may be disabled.</li>
              <li>Continued usage may be limited.</li>
            </ul>
            <h5>
              For uninterrupted access and full functionality, consider upgrading.
            </h5>
          </p>
        </PopupModal>
      </div>
    );
  }
}

function mapStateToProps({ user }) {
  return {
    user
  };
}

export default connect(mapStateToProps, null)(Home);
