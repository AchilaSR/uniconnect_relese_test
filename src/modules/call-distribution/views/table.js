import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loader from '../../../components/Loader';
import _ from 'lodash';
import { Table } from 'reactstrap';
import { formatCurrency, formatMSecondsToTime, removeMilliseconds, formatTimeToSeconds, formatDuration } from '../../../config/util';

class DistributionTable extends Component {

  render() {

    const { call_distribution } = this.props;

    if (!call_distribution || !Array.isArray(call_distribution) || call_distribution.length === 0) {
      return "No records found";
    }


    let scale = "";
    let start; let len;
    if (call_distribution.length > 27) {
      scale = "Date"
      start = 0
      len = 10
    }

    if (call_distribution.length === 24) {
      scale = "Hour"
      start = 11
      len = 8
    }

    if (call_distribution.length === 12) {
      scale = "Month"
      start = 0
      len = 7
    }


    if (!call_distribution) {
      return <Loader />;
    }


    return <div className="sticky-table">
      <Table style={{ backgroundColor: "#ffffff" }} className='activity-summary' size='sm' bordered>
        <thead>
          <tr style={{ verticalAlign: "middle" }}>
            <th style={{ minWidth: 90, maxWidth: 90 }} rowSpan="3">{scale}</th>
            <th colSpan="15">Inbound</th>
            <th colSpan="7">Outbound</th>
            <th colSpan="4">Total</th>
          </tr>

          <tr style={{ verticalAlign: "middle" }}>
            <th rowSpan="3" className='notfixed' style={{ minWidth: 90, maxWidth: 90 }}>Total</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Answered</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Answered within SLA</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Service Level %</th>
            <th colSpan="3">Abandoned Calls</th>
            <th colSpan="3">Average Waiting Time</th>

            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Answering Speed</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Ans. AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Unans. AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Hold Time</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Talking Time</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Total</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Answered</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Unanswered</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Ans.AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Unans. AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Hold Time</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Talking Time</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Ans. AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Unans. AHT</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Hold Time</th>
            <th rowSpan="3" style={{ minWidth: 90, maxWidth: 90 }}>Average Talking Time</th>
          </tr>

          <tr style={{ verticalAlign: "middle" }}>
            <th className='notfixed' style={{ minWidth: 90, maxWidth: 90 }}>Count</th>
            <th style={{ minWidth: 90, maxWidth: 90 }}>%</th>
            <th style={{ minWidth: 90, maxWidth: 90 }}>Abandoned within SLA</th>
            <th style={{ minWidth: 90, maxWidth: 90 }}>Answered</th>
            <th style={{ minWidth: 90, maxWidth: 90 }}>Abandoned</th>
            <th style={{ minWidth: 90, maxWidth: 90 }}>Total</th>
          </tr>
        </thead>
        <tbody >

          {call_distribution.map((data, r) => {
            if (!Array.isArray(call_distribution)) {
              return "No records found";
            }
            //average answering speed = sum_ringing_answered / inbound_answered
            let inbound_avg_ans_speed = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_ringing_answered) / data.inbound_answered));
            //average answered handling time = (taking + wrap) / answered
            let inbound_avg_ans_ht = formatDuration((formatTimeToSeconds(data.sum_talking_inbound) + formatTimeToSeconds(data.sum_wrap_inbound_answered)) / data.inbound_answered);
            let outbound_avg_ans_ht = formatDuration((formatTimeToSeconds(data.sum_talking_outbound) + formatTimeToSeconds(data.sum_wrap_outbound_answered)) / data.outbound_answered);
            let total_avg_ans_ht = formatDuration(
              ((formatTimeToSeconds(data.sum_talking_inbound) + formatTimeToSeconds(data.sum_wrap_inbound_answered)) +
                (formatTimeToSeconds(data.sum_talking_outbound) + formatTimeToSeconds(data.sum_wrap_outbound_answered))) /
              (data.inbound_answered + data.outbound_answered)
            );
            //average unanswered handling time = (unasnwered wrap) / unanswered
            let inbound_avg_unans_ht = formatDuration(formatTimeToSeconds(data.sum_wrap_inbound_unanswered) / data.inbound_unanswered)
            let outbound_avg_unans_ht = formatDuration(formatTimeToSeconds(data.sum_wrap_outbound_unanswered) / data.outbound_unanswered);
            // console.log(formatCurrency(formatTimeToSeconds(data.sum_wrap_outbound_unanswered) / data.outbound_unanswered))
            let total_avg_unans_ht = formatDuration(
              ((formatTimeToSeconds(data.sum_wrap_inbound_unanswered)) + formatTimeToSeconds(data.sum_wrap_outbound_unanswered)) /
              (data.inbound_unanswered + data.outbound_unanswered)
            );
            //average hold time = sum_hold_time / answered calls
            let inbound_avg_hold_time = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_hold_inbound) / data.inbound_answered))
            let outbound_avg_hold_time = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_hold_outbound) / data.outbound_answered))
            let total_avg_hold_time = formatDuration(
              (formatTimeToSeconds(data.sum_hold_inbound) + formatTimeToSeconds(data.sum_hold_outbound)) /
              (data.inbound_answered + data.outbound_answered)
            );
            //average talking time = (sum_talking_time) / answered calls
            let inbound_avg_tt = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_talking_inbound) / data.inbound_answered))
            let outbound_avg_tt = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_talking_outbound) / data.outbound_answered))
            let total_avg_tt = formatDuration(
              (formatTimeToSeconds(data.sum_talking_inbound) +
                formatTimeToSeconds(data.sum_talking_outbound)) /
              (data.inbound_answered + data.outbound_answered)
            );


            let AWT_answered = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_waiting_answered) / data.inbound_answered));
            let AWT_abandoned = formatDuration(formatCurrency(formatTimeToSeconds(data.sum_waiting_unanswered) / data.inbound_unanswered));
            let AWT_total = formatDuration(formatCurrency((formatTimeToSeconds(data.sum_waiting_answered) + formatTimeToSeconds(data.sum_waiting_unanswered)) / (data.inbound_answered + data.inbound_unanswered)));

            return (<tr key={r}>
              <th>{data.time_period.substr(start, len)}</th>
              <td style={{ textAlign: 'right' }}>{data.inbound_total}</td>
              <td style={{ textAlign: 'right' }}>{data.inbound_answered}</td>
              <td style={{ textAlign: 'right' }}>{data.inbound_answered_within_sla}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(data.inbound_answered_within_sla / data.inbound_total * 100)}</td>
              <td style={{ textAlign: 'right' }}>{data.inbound_unanswered}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(data.inbound_unanswered / (data.inbound_total) * 100)}</td>
              <td style={{ textAlign: 'right' }}>{data.inbound_unanswered_within_sla}</td>

              <td style={{ textAlign: 'right' }}>{AWT_answered != "00:00:00" ? AWT_answered : "-"}</td>
              <td style={{ textAlign: 'right' }}>{AWT_abandoned != "00:00:00" ? AWT_abandoned : "-"}</td>
              <td style={{ textAlign: 'right' }}>{AWT_total != "00:00:00" ? AWT_total : "-"}</td>

              <td style={{ textAlign: 'right' }}>{inbound_avg_ans_speed != "00:00:00" ? inbound_avg_ans_speed : "-"}</td>
              <td style={{ textAlign: 'right' }}>{inbound_avg_ans_ht != "00:00:00" ? inbound_avg_ans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{inbound_avg_unans_ht != "00:00:00" ? inbound_avg_unans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{inbound_avg_hold_time != "00:00:00" ? inbound_avg_hold_time : "-"}</td>
              <td style={{ textAlign: 'right' }}>{inbound_avg_tt != "00:00:00" ? inbound_avg_tt : "-"}</td>
              <td style={{ textAlign: 'right' }}>{data.outbound_total}</td>
              <td style={{ textAlign: 'right' }}>{data.outbound_answered}</td>
              <td style={{ textAlign: 'right' }}>{data.outbound_unanswered}</td>
              <td style={{ textAlign: 'right' }}>{outbound_avg_ans_ht != "00:00:00" ? outbound_avg_ans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{outbound_avg_unans_ht != "00:00:00" ? outbound_avg_unans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{outbound_avg_hold_time != "00:00:00" ? outbound_avg_hold_time : "-"}</td>
              <td style={{ textAlign: 'right' }}>{outbound_avg_tt != "00:00:00" ? outbound_avg_tt : "-"}</td>
              <td style={{ textAlign: 'right' }}>{total_avg_ans_ht != "00:00:00" ? total_avg_ans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{total_avg_unans_ht != "00:00:00" ? total_avg_unans_ht : "-"}</td>
              <td style={{ textAlign: 'right' }}>{total_avg_hold_time != "00:00:00" ? total_avg_hold_time : "-"}</td>
              <td style={{ textAlign: 'right' }}>{total_avg_tt != "00:00:00" ? total_avg_tt : "-"}</td>
            </tr>)
          })}
        </tbody>
      </Table>
    </div>;
  }
}


function mapStateToProps({ call_distribution }) {
  return {
    call_distribution
  };
}


export default connect(mapStateToProps, null)(DistributionTable);
