import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { checkPermission, formatDateTime, formatPhone } from '../../../../config/util';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button } from 'reactstrap';
import Modal from '../../../../components/Modal';
import { connect } from 'react-redux';
import { API_URL, RECORDINGS_URL, RECORDINGS_URL_BACKUP } from '../../../../config/globals';
import ContactButton from '../../../../modules/crm/views/components/contactButton';
import Add from '../../../../modules/call-log-record/views/add';
import DispositionData from '../../../../modules/call-log-disposition/views/dispositionData';
class CallLogsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: null,
      userWriteAccess: false,
      userReadAccess: false,
      contactManagement: false,
      showRecord: false,
      showDisposition: false,
      callLogData: "",
    };
  }

  componentWillMount() {
    this.setState({
      userWriteAccess: checkPermission('Call Logs Management', 'WRITE'),
      userReadAccess: checkPermission('Call Logs Management', 'READ'),
      contactManagement: checkPermission("Contacts Management", 'READ')
    });
  }

  urlExists(url) {
    try {
      var http = new XMLHttpRequest();
      http.open('HEAD', url, false);
      http.send();
      return http.status !== 404;
    } catch (ex) {
      return false;
    }
  }

  download(url) {
    const primary = `${RECORDINGS_URL}/${url}`;
    const backup = `${RECORDINGS_URL_BACKUP}/${url}`;

    if (this.urlExists(primary)) {
      window.open(primary, '_blank');
    } else {
      window.open(backup, '_blank');
    }
  }

  addCallLog(data) {
    this.setState({ showRecord: true, callLogData: data })
  }

  getDispostionData(data) {
    this.setState({ showDisposition: true, callLogData: data })
  }

  render() {
    const { call_logs } = this.props;
    // const my_extension = `Ext.${this.props.user.user_details.extension}`;

    if (!call_logs) {
      return "Please generate the report";
    } else if (call_logs.length === 0) {
      return "No records found";
    }

    const expandRow = {
      onlyOneExpanding: true,
      expandByColumnOnly: true,
      showExpandColumn: true,
      expanded: [this.state.expanded],
      expandColumnPosition: 'right',
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        return null;
      },
      expandColumnRenderer: (row) => {
        if (row.expandable) {
          if (row.expanded) {
            return (
              <Button size="xs" color="danger" title="Stop"><i className="fa fa-stop" ></i></Button>
            );
          }
          return (
            <Button size="xs" color="success" title="Play"><i className="fa fa-play"></i></Button>
          );
        } else {
          // return <Button disabled size="xs" color="success"  title="Play"><i className="fa fa-play" ></i></Button>
          return <span></span>
        }
      },
      renderer: row => (
        <div className="text-center">
          <audio onContextMenu={(e) => e.preventDefault()} controlsList="nodownload" autoPlay style={{ verticalAlign: "middle" }} controls>
            {/* <source src={`${RECORDINGS_URL}/${encodeURIComponent(row.recording_url)}`} type="audio/wav" /> */}
            {/* <source src={`${RECORDINGS_URL_BACKUP}/${encodeURIComponent(row.recording_url)}`} type="audio/wav" /> */}

            <source src={`${API_URL}/downloadRecording?file_name=${encodeURIComponent(row.recording_url)}&access_token=${this.props.user.access_token}`} type="audio/wav" />
            <source src={`${API_URL}/downloadRecording?file_name=${encodeURIComponent(row.recording_url)}&access_token=${this.props.user.access_token}`} type="audio/wav" />
          </audio>
        </div>
      ),
      nonExpandable: call_logs.map((a) => {
        // if (a.recording_url && (this.state.userWriteAccess || a.source_caller_id === my_extension || a.destination_caller_id === my_extension)) {
        if (a.recording_url) {
          return null
        } else {
          return a.id
        }
      }),
      onExpand: (row) => {
        this.setState({ expanded: row.id })
      }
    };

    const sizePerPageRenderer = ({
      options,
      currSizePerPage,
      onSizePerPageChange
    }) => (
      <div className="btn-group" role="group">
        {
          options.map((option) => {
            const isSelect = currSizePerPage === `${option.page}`;
            return (
              <button
                key={option.text}
                type="button"
                onClick={() => onSizePerPageChange(parseInt(option.page))}
                className={`btn btn-page ${isSelect ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {option.text}
              </button>
            );
          })
        }
      </div>
    );

    const sizePerPageList = [...[10, 25, 50, 100].map(a => ({ text: a, value: a })), {
      text: 'All', value: call_logs.length
    }]

    const columns = [{
      dataField: 'call_id',
      text: '#',
      headerStyle: {
        width: 50
      },
    }, {
      dataField: 'type',
      text: 'Type'
    }, {
      dataField: 'start_time',
      text: 'Call Time',
      formatter: (cellContent, row) => {
        return formatDateTime(cellContent);
      },
      headerStyle: {
        width: 100
      },
      sort: true
    }, {
      dataField: 'source_caller_id',
      text: 'Calling Party',
      formatter: (cellContent, row) => {
        return <div>{cellContent}<br />{row.source_display_name}</div>;
      },
      headerStyle: {
        width: "25%"
      },
    }, {
      dataField: 'destination_caller_id',
      text: 'Called Party',
      formatter: (cellContent, row) => {
        return <div>{cellContent}<br />{row.destination_display_name}</div>;
      },
      headerStyle: {
        width: "25%"
      },
    }, {
      dataField: 'ringing_duration',
      text: 'Ring Time',
      headerStyle: {
        width: 80
      },
      sort: true,
    }, {
      dataField: 'talking_duration',
      text: 'Talk Time',
      headerStyle: {
        width: 80
      },
      sort: true,
    }, {
      dataField: 'answered',
      text: 'Status',
      formatter: (cellContent, row) => {
        if (cellContent) {
          return "Answered"
        } else if (row.type.toLowerCase() === "queues") {
          if (row.action_type === 5) {
            return "Unanswered\nQueue Disconnected";
          } else if (row.action_type === 6) {
            return "Unanswered\nCustomer Disconnected";
          }
        }
        return `Unanswered`;
      },
      classes: (cellContent, row) => {
        return cellContent ? "font-small bg-success text-center" : "fontsize-small bg-danger text-center";
      },
      headerStyle: {
        width: 80
      },
    }, {
      dataField: 'recording_url',
      text: "",
      formatter: (cellContent, row) => {
        let phone = formatPhone(row.destination_caller_id);
        if (!phone) {
          phone = formatPhone(row.source_caller_id);
        }

        return (
          <div className="d-flex justify-content-center">
            <Button className="btn btn-xs btn-outline-primary ml-1" onClick={() => this.getDispostionData(row)} color="white" title="Disposition"><i className="fa fa-comment" ></i></Button>
            <Button className="btn btn-xs btn-outline-primary ml-1" onClick={() => this.addCallLog(row)} color="white" title="Add Note"><i className="fa fa-sticky-note-o" ></i></Button>
            {this.state.contactManagement ? <ContactButton className="btn btn-xs btn-outline-primary ml-1" value={phone} newTab={true} title="Contact"><i className="fa fa-user" ></i></ContactButton> : ""}
            {cellContent && this.state.userWriteAccess ?
              <button className="btn btn-xs btn-outline-primary ml-1" onClick={() => this.download(`${encodeURIComponent(row.recording_url)}`)} title="Download"><i className="fa fa-download" ></i></button> :
              <button disabled className="btn btn-xs btn-outline-primary ml-1"><i className="fa fa-download" ></i></button>}
          </div>
        );
      },
      headerStyle: {
        width: 40
      },
    }];
    return (
      <div>
        <BootstrapTable
          defaultSorted={[{
            dataField: 'start_time',
            order: 'desc'
          }]}
          classes="expandable"
          wrapperClasses='table-responsive'
          expandRow={expandRow}
          pagination={paginationFactory({ sizePerPageRenderer, sizePerPageList })}
          keyField='id'
          data={call_logs}
          columns={columns}
        />
        <Modal title="Call Log Record" toggle={() => { this.setState({ showRecord: !this.state.showRecord }) }} isOpen={this.state.showRecord}>
          <Add onSuccess={() => { this.setState({ showRecord: false }) }} data={this.state.callLogData} />
        </Modal>
        <Modal title="Disposition" toggle={() => { this.setState({ showDisposition: !this.state.showDisposition }) }} isOpen={this.state.showDisposition}>
          <DispositionData onSuccess={() => { this.setState({ showDisposition: false }) }} data={this.state.callLogData} />
        </Modal>

      </div>

    );
  }
}


function mapStateToProps({ user }) {
  return {
    user
  };
}
export default (connect(mapStateToProps, null)(CallLogsTable));