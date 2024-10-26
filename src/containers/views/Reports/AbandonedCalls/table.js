import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { connect } from "react-redux";
import { flattenArray, formatCurrency, getReportData } from '../../../../config/util';

class OutboundReport extends Component {
  render() {
    const { abandoned_calls } = this.props;

    return (

      <div className="sticky-table">
        <Table bordered>
          <thead>
            <tr>
              <th rowSpan="2">Queues</th>
              <th style={{ width: 100 }} rowSpan="2">Total Calls</th>
              <th style={{ width: 80 }} rowSpan="2">Answered Calls</th>
              <th style={{ width: 50 }} rowSpan="2">%</th>
              <th colSpan={6}>Abandoned Calls</th>
            </tr>
            <tr>
              <th style={{ width: 80 }}>Total</th>
              <th style={{ width: 50 }}>%</th>
              <th style={{ width: 80 }}>&gt;= 5 Sec</th>
              <th style={{ width: 50 }}>%</th>
              <th style={{ width: 80 }}>&gt;= 10 Sec</th>
              <th style={{ width: 50 }}>%</th>
            </tr>
          </thead>
          <tbody>
            {
              abandoned_calls.map((row) => {
                return <tr>
                  <th>{row.queue_name}</th>
                  <td className='text-right'>{row.inbound_calls}</td>
                  <td className='text-right'>{row.inbound_calls_answered}</td>
                  <td className='text-right'>{formatCurrency(row.inbound_calls_answered / row.inbound_calls * 100)}</td>
                  <td className='text-right'>{row.inbound_calls_unanswered}</td>
                  <td className='text-right'>{formatCurrency((row.inbound_calls_unanswered) / row.inbound_calls * 100)}</td>
                  <td className='text-right'>{row.inbound_calls_unanswered_after_5_sec}</td>
                  <td className='text-right'>{formatCurrency((row.inbound_calls_unanswered_after_5_sec) / row.inbound_calls * 100)}</td>
                  <td className='text-right'>{row.inbound_calls_unanswered_after_10_sec}</td>
                  <td className='text-right'>{formatCurrency((row.inbound_calls_unanswered_after_10_sec) / row.inbound_calls * 100)}</td>
                </tr>
              })}
          </tbody>
        </Table>
      </div>
    );
  }
}


function mapStateToProps({ abandoned_calls }) {
  return {
    abandoned_calls,
  };
}
export default connect(mapStateToProps, null)(OutboundReport);