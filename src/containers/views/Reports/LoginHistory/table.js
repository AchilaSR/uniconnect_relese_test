import React, { Component } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { formatMSecondsToTime, removeMilliseconds } from '../../../../config/util';
import { NOTIFICATION_REFRESH_INTERVAL } from '../../../../config/globals';

class Dial extends Component {

  render() {
    const { login_history, agents } = this.props;

    if (!login_history) {
      return "Please generate the report";
    }

    if (login_history.length === 0) {
      return "No records found";
    }

    const columns = [{
      dataField: 'agent_name',
      text: 'Agent Name'
    }, {
      dataField: 'agent_extension',
      text: 'Extension',
      headerStyle: {
        width: 100
      },
      align: 'center'
    }, {
      dataField: 'login_time',
      text: 'Login Time',
      headerStyle: {
        width: 175
      },
      formatter: (cellContent, row) => {
        if (!cellContent) {
          return "";
        }
        return removeMilliseconds(cellContent);
      },
      align: 'center'
    }, {
      dataField: 'last_active_time',
      text: 'Last Active Time',
      headerStyle: {
        width: 175
      },
      formatter: (cellContent, row) => {
        if (!cellContent) {
          return "";
        }
        return removeMilliseconds(cellContent);
      },
      align: 'center',
    }, {
      dataField: 'duration',
      text: 'Duration',
      headerStyle: {
        width: 175
      },
      align: 'center'
    }];
    return (
      <BootstrapTable pagination={paginationFactory({ hideSizePerPage: true })} keyField='id' data={login_history} columns={columns} />
    );
  }
}


function mapStateToProps({ login_history, agents }) {
  return {
    login_history, agents
  };
}


export default connect(mapStateToProps, null)(Dial);
