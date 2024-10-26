import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button } from 'reactstrap';
import { removeMilliseconds } from '../../../../config/util';

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const { data } = this.props;

    const columns = [{
      dataField: 'queue',
      text: 'Queue',
      headerStyle: {
        width: 50
      },
      classes: "text-center",
    }, {
      dataField: 'caller_num',
      text: 'Caller Number',
      headerStyle: {
        width: 120
      }
    }, {
      dataField: 'caller_waiting_during',
      text: 'Waiting Time',
      classes: "text-center",
      formatter: (cellContent, row) => {
        return removeMilliseconds(cellContent);
      },
      headerStyle: {
        width: 120
      },
      sort: true
    }, {
      dataField: 'caller_waiting_start',
      text: 'Start Time',
      classes: "text-right",
      headerStyle: {
        width: 140
      },
      sort: true
    }, {
      dataField: 'caller_waiting_end',
      text: 'End Time',
      classes: "text-right",
      headerStyle: {
        width: 140
      },
      sort: true
    }, {
      dataField: 'call_status',
      classes: "text-left",
      text: 'Call Status'
    }];

    const expandRow = {
      onlyOneExpanding: true,
      expandByColumnOnly: true,
      showExpandColumn: true,
      expanded: [this.state.expanded],
      expandColumnPosition: 'left',
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        return "";
      },
      expandColumnRenderer: (row) => {
        if (row.expandable) {
          if (row.expanded) {
            return (
              <Button color='link' size="xs"><i className="fa fa-minus" ></i></Button>
            );
          }
          return (
            <Button color='link' size="xs"><i className="fa fa-plus" ></i></Button>
          );
        } else {
          return ""
        }
      },
      renderer: row => {
        const logs = _.filter(data, { call_id: row.call_id });
        return <div className='bg-white w-100' style={{ display: 'table' }}>
          <tr>
            <th>Agent Extension</th>
            <th>Agent Name</th>
            <th>Total Ring Time</th>
            <th>Ring Time Start</th>
            <th>Ring Time End</th>
            <th>Polling Status</th>
          </tr>
          {logs.map((row) => {
            return <tr>
              <td>{row.agent_ext}</td>
              <td className='text-left'>{row.agent_name}</td>
              <td>{removeMilliseconds(row.ring_time)}</td>
              <td>{row.ring_start_time}</td>
              <td>{row.ring_end_time}</td>
              <td className='text-left'>{row.fail_reason}</td>
            </tr>
          })}
        </div>
      },
      // nonExpandable: _.chain(data).countBy('call_id').pickBy((a) => a === 1).keys().value()
    };

    return (
      <BootstrapTable
        classes="expandable"
        expandRow={expandRow}
        pagination={paginationFactory({ hideSizePerPage: true })}
        keyField='call_id'
        data={_.uniqBy(data, 'call_id')}
        columns={columns}
      />
    );
  }
}

export default Table;