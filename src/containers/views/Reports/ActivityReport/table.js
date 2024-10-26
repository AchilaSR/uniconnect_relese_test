import React, { Component } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../../components/Loader';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { checkPermission, removeMilliseconds } from '../../../../config/util';
import { Badge } from 'reactstrap';

class Dial extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showBreakCol: false
    }
  }

  componentWillMount() {
    this.setState({ showBreakCol: checkPermission('Break Approval', 'READ') });
  }

  render() {
    const { agent_activity_logs, agent_activities } = this.props;

    if (!agent_activity_logs) {
      return "Please generate the report";
    }

    if (agent_activity_logs.length === 0) {
      return "No records found";
    }

    if (!agent_activities) {
      return <Loader />;
    }

    const getClassByStatus = (cellContent) => {
      if (cellContent) {
        const status = _.find(agent_activities, (s) => {
          return s.status_name.toLowerCase() === cellContent.toLowerCase()
        });
        if (status) {
          return `col-status bg-${status.color_desc}`;
        } else if (cellContent === "Login") {
          return "col-status bg-ORANGE";
        } else {
          return "";
        }
      } else {
        return "";
      }
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
      dataField: 'status_name',
      text: 'Status',
      headerStyle: {
        width: 100
      },
      align: 'center',
      classes: getClassByStatus,
      formatter: (cellContent, row) => <div>
        {row.status_name == "Break" && this.state.showBreakCol ? <> {cellContent} <br /> <Badge color={
          row.approval_status === "Pending" ? 'warning' :
            row.approval_status === "Rejected" ? 'danger' :
              row.approval_status === "Approved" ? 'success' : 'primary'
        }>
          {row.approval_status}</Badge></> : <>{cellContent}</>}

      </div>,
    }, {
      dataField: 'sub_status_name',
      text: 'Sub Status',
    }, {
      dataField: 'status_duration',
      text: 'Duration',
      headerStyle: {
        width: 100
      },
      formatter: (cellContent, row) => {
        if (!cellContent) {
          return "";
        }
        return removeMilliseconds(cellContent);
      },
      align: 'center',
    }, {
      dataField: 'requested_on',
      text: 'Time Stamp',
      headerStyle: {
        width: 175
      },
      align: 'center'
    }];
    return (
      <BootstrapTable pagination={paginationFactory({ hideSizePerPage: true })} keyField='id' data={agent_activity_logs} columns={columns} />
    );
  }
}


function mapStateToProps({ agent_activity_logs, agent_activities }) {
  return {
    agent_activity_logs,
    agent_activities
  };
}


export default connect(mapStateToProps, null)(Dial);
