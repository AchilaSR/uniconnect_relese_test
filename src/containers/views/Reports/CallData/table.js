import React, { Component } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button } from 'reactstrap';
import { checkPermission, removeMilliseconds } from '../../../../config/util';
import { RECORDINGS_URL, RECORDINGS_URL_BACKUP } from '../../../../config/globals';
import _ from 'lodash';
import AudioPlayer from './audio-player';
class RecordingTable extends Component {
  constructor(props) {
    super(props);
    this.state = { enableDownload: false }
  }

  componentDidMount() {
    if (checkPermission("Call Logs Management", "deleteaccess")) {
      this.setState({ enableDownload: true })
    }
  }

  isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
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

  render() {
    const { data } = this.props;

    const getLabel = (a) => {
      switch (a) {
        case 'q_wait_dur':
          return "Queue Waiting";
        case "ringing_dur":
          return "Ringing";
        case "talking_dur":
          return "Talking";
        case "hold_time":
          return "Hold Time";
        case "wrap_time":
          return "Wrap Time";
        default:
          return a;
      }
    }

    const formatDispostion = (row) => {
      if (!row.disposition) {
        return "";
      }
      if (this.isValidJSON(row.disposition)) {
        const parsedData = JSON.parse(row.disposition);
        if (parsedData.data && Array.isArray(parsedData.data)) {
          return (
            <div className='form-inline'>
              {parsedData.data.map(([key, value], index) => value ? (
                <div key={index} style={{ minWidth: 110 }} className='mr-3 mb-3'>
                  <div><small>{_.startCase(key)}</small></div>
                  <div>{value}</div>
                </div>
              ) : "")}
            </div>
          );
        } else {
          return (
            <div className='form-inline'>
              {Object.entries(parsedData).map(([key, value], index) => {
                if (key === 'disposition' && Array.isArray(value)) {
                  return value.map(([dispositionKey, dispositionValue], dispositionIndex) => (
                    <div key={dispositionIndex} style={{ minWidth: 110 }} className='mr-3 mb-3'>
                      <div><small>{_.startCase(dispositionKey)}</small></div>
                      <div>{dispositionValue}</div>
                    </div>
                  ));
                } else {
                  return (
                    <div key={index} style={{ minWidth: 110 }} className='mr-3 mb-3'>
                      <div><small>{_.startCase(key)}</small></div>
                      <div>{value}</div>
                    </div>
                  );
                }
              })}
            </div>
          );
        }
      } else {
        return row.disposition;
      }
    }


    const formatLeadDetails = (row) => {
      if (!row.lead_details) {
        return "";
      }
      if (this.isValidJSON(row.lead_details)) {
        const parsedData = JSON.parse(row.lead_details);
        if (parsedData.data && Array.isArray(parsedData.data)) {
          return (
            <div className='form-inline'>
              {parsedData.data.map(([key, value], index) => value ? (
                <div key={index} style={{ minWidth: 110 }} className='mr-3 mb-3'>
                  <div><small>{_.startCase(key)}</small></div>
                  <div>{value}</div>
                </div>
              ) : "")}
            </div>
          );
        } else {
          return (
            <div className='form-inline'>
              {Object.entries(parsedData).map(([key, value], index) => (
                <div key={index} style={{ minWidth: 110 }} className='mr-3 mb-3'>
                  <div><small>{_.startCase(key)}</small></div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          );
        }
      } else {
        return row.lead_details;
      }
    }

    function splitByCommaIfWav(str) {
      // Use a regular expression to match the pattern of a ".wav" file
      const regex = /([^,]*\.wav)/g;
      let matches = str.match(regex);
  
      // If there are no matches or only one match, return the original string in an array
      if (!matches || matches.length <= 1) {
          return [str];
      }
  
      // Split the string by commas and process each segment
      let parts = str.split(',');
      let result = [];
      let currentPart = '';
  
      for (let i = 0; i < parts.length; i++) {
          let part = parts[i].trim();
          currentPart += (currentPart ? ', ' : '') + part;
  
          // If the current part contains ".wav", push it to the result array
          if (part.includes('.wav')) {
              result.push(currentPart);
              currentPart = '';
          }
      }
  
      // If there's any remaining part, add it to the result
      if (currentPart) {
          result.push(currentPart);
      }
  
      return result;
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
        if (row.expanded) {
          return (
            <Button size="xs" outline title="Collpase"><i className="fa fa-eye-slash" ></i></Button>
          );
        }
        return (
          <Button size="xs" outline title="Expand"><i className="fa fa-eye"></i></Button>
        );
      },
      renderer: row => (
        <div className='d-flex'>
          <div className='flex-grow-1'>
            <div>
              <div className='d-flex flex-wrap'>
                <div style={{ minWidth: 110 }} className='mr-3 my-3'>
                  <div><small>Call ID</small></div>
                  <div>{row.id}</div>
                </div>
                {["q_wait_dur", "ringing_dur", "talking_dur", "hold_time", "wrap_time"].map((a) => (row[a] ? <div style={{ minWidth: 110 }} className='mr-3 my-3'>
                  <div><small>{getLabel(a)}</small></div>
                  <div>{removeMilliseconds(row[a])}</div>
                </div> : ""))}
                <div style={{ minWidth: 200 }} className='mr-3 my-3'>
                  <div><small>Terminated By</small></div>
                  <div>{row.terminated_by}</div>
                </div>
              </div>
              {row.disposition ? <div className='mr-3 my-3'>
                <div><b>Disposition Note</b></div>
                <hr style={{ height: '10px', margin: '0' }} />
                <div className='d-flex flex-wrap'>{formatDispostion(row)}</div>
              </div> : ""}
              {row.lead_details ? <div className='mr-3 my-3'>
                <div><b>Lead Details</b></div>
                <hr style={{ height: '10px', margin: '0' }} />
                <div className='d-flex flex-wrap'>{formatLeadDetails(row)}</div>
              </div> : ""}
            </div>
          </div>
          {
            row.recording_url ?
              <div style={{ width: 350 }}>
                {splitByCommaIfWav(row.recording_url).map(rurl => <AudioPlayer enableDownload={this.state.enableDownload} rurl={`/downloadRecording?file_name=${encodeURIComponent(rurl.trim())}&access_token=${this.props.user.user.access_token}`} />)}
              </div> : ""
          }
        </div >
      ),


      nonExpandable: data.map((a) => {
        // if (a.recording_url && (this.state.userWriteAccess || a.source_caller_id === my_extension || a.destination_caller_id === my_extension)) {
        // if (a.recording_url) {
        //   return null
        // } else {
        //   return a.uuid
        // }
      }),
      onExpand: (row) => {
        if (this.state.expanded === row.uuid) {
          this.setState({ expanded: null })
        } else {
          this.setState({ expanded: row.uuid })
        }
      }
    };

    const columns = [
      {
        dataField: 'start_time',
        text: 'Call Time'
      },
      {
        dataField: 'call_type',
        text: 'Call Type',
        headerStyle: {
          width: 60
        },
        classes: (cell) => {
          let cl = 'text-capitalize text-center ';
          switch (cell) {
            case 'outbound':
              return cl + 'bg-secondary text-white';
            case 'inbound':
              return cl + 'bg-primary';
            case 'internal':
              return cl + 'bg-light';
            case 'ringmymobile':
              return cl + 'bg-warning';
            case 'conference':
              return cl + 'bg-info';
          }
        }
      }, {
        dataField: 'customer',
        text: 'Customer',
        headerStyle: {
          width: 80
        }
      }, {
        dataField: 'hotline',
        text: 'Hotline',
        headerStyle: {
          width: 80
        }
      }, {
        dataField: 'agent',
        text: 'Agent',
        formatter: (col, row) => <div>
          {row.is_answered ? <span className='text-success'><i className='fa fa-check'></i></span> : <span className='text-danger'><i className='fa fa-times'></i></span>}
          <span className='ml-2'>{col ? col === 'none' ? "None" : `[${col}] ${row.agent_name}` : ""}</span>
        </div>
      }, {
        dataField: 'queue',
        text: 'Queue',
        formatter: (col, row) => (col ? `[${col}] ${row.queue_name}` : "")
      }, {
        dataField: 'talking_dur',
        text: 'Talk Time',
        formatter: (cell, row) => removeMilliseconds(cell),
        headerStyle: {
          width: 100
        },
        classes: "text-center",
        sort: true
      },
    ];

    return (
      <div>
        <BootstrapTable
          pagination={paginationFactory({ hideSizePerPage: true })}
          wrapperClasses="table-responsive"
          keyField='uuid'
          data={data.sort((a, b) => {
            return new Date(b.start_time) - new Date(a.start_time);
          })}
          columns={columns}
          expandRow={expandRow}
        />
      </div >
    );
  }
}

const mapStateToProps = user => {
  return {
    user
  };
};

export default connect(mapStateToProps)(RecordingTable);
