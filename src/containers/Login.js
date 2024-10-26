import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardBody, CardGroup, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import LoginForm from './forms/LoginForm';
import { login } from '../actions/index';
import logo from '../theme/logo.png';
import text from '../theme/texts.json';
import { LOGIN_METHODS } from '../config/globals';
import OtpLogin from '../modules/otp-login/views/OtpLogin';
import classnames from "classnames";
import PasswordLogin from '../modules/password-login/views/PasswordLogin';

const currentVersion = require("../../package.json").version;
const releaseDate = require("../../package.json").releaseDate;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      api_version: "",
      activeTab: LOGIN_METHODS[0]
    }
  }

  toggle(tab) {
    this.setState({ activeTab: tab });
  }

  componentDidMount() {
    // getVersion((ver) => {
    //   this.setState({ api_version: JSON.stringify(ver) })
    // })
  }

  render() {
    const { login } = this.props;
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="text-white bg-primary">
                  <CardBody>
                    <div>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                    </div>
                    <div className='login-tabs'>
                      <Nav tabs>
                        {LOGIN_METHODS.map(a => (<NavItem key={a}>
                          <NavLink
                            className={classnames({ active: this.state.activeTab === a })}
                            onClick={() => { this.toggle(a) }}>
                            {a}
                          </NavLink>
                        </NavItem>))}
                      </Nav>
                      <TabContent style={{ height: 155 }} activeTab={this.state.activeTab} >
                        <TabPane tabId="Password">
                          <PasswordLogin />
                        </TabPane>
                        <TabPane tabId="3CX">
                          <LoginForm onSubmit={login} />
                        </TabPane>
                        <TabPane tabId="OTP">
                          <OtpLogin />
                        </TabPane>
                      </TabContent>
                    </div>
                  </CardBody>
                </Card>
                <Card className="py-4 d-md-down-none bg-white" style={{ width: 44 + '%' }}>
                  <CardBody className="text-center">
                    <div>
                      <div style={{ display: "inline-block" }} className='p-3 px-5 rounded mb-3 bg-white'>
                        <img src={logo} alt={"UniConnect.io"} className="mb-2" style={{ width: 150, maxHeight: 60, objectFit: "contain" }} />
                      </div>
                      <h4>{text.title}</h4>
                      <p style={{ fontSize: "0.8rem" }}>{text.description}</p>
                      <p><small>Release {currentVersion} ({releaseDate})</small></p>
                      {/* <p><small>API Version {this.state.api_version}</small></p> */}
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    login
  }, dispatch);
}


export default (connect(null, mapDispatchToProps)(Login));