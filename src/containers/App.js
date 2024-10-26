import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import ReduxToastr from 'react-redux-toastr';
import history from '../history';


import Home from './Home';
import Login from './Login';
import { HOMEPAGE } from '../config/globals';

class App extends Component {
  render() {
    const { user } = this.props;    
    return (
      <div>
        <ReduxToastr preventDuplicates />
        <Router basename={HOMEPAGE} history={history}>
          <Switch>
            {
              user && typeof user.crm_user !== "undefined" ? <Route path="/" name="Home" component={Home} /> : <Route path="/" name="Login Page" component={Login} />
            }
          </Switch>
        </Router>
      </div>

    );
  }
}

function mapStateToProps({ user }) {
  return {
    user
  };
}

export default connect(mapStateToProps, null)(App);
