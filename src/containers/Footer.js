import React, { Component } from 'react';
import PropTypes from 'prop-types';
const currentVersion = require("../../package.json").version;
const releaseDate = require("../../package.json").releaseDate;
const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {
    return (
      <React.Fragment>
        <span><a href="https://simsyn.com/">SimSyn Private Limited</a> &copy; 2023</span>
        <span className="ml-auto">Release {currentVersion} ({releaseDate})</span>
        <span className="ml-auto">Support Hotline +94 117 687 575</span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
