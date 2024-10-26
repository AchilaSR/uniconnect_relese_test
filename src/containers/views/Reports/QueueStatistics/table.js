import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";

class ActivityTable extends Component {
  render() {
    const { queue_statistics } = this.props;

    if (!queue_statistics || !queue_statistics.result) {
      return "Please generate the report";
    }

    return (
      <div className="sticky-table">
        <Table size="sm">
          <thead>
            <tr>
              <th style={{ minWidth: 100, maxWidth: 100, overflow: 'auto' }}>
                Call Queues - {queue_statistics.query.queues.join(" ")}
              </th>
              {queue_statistics.result[0].stats.map((e) => {
                return (
                  <th style={{ width: 200 }} colSpan="3" key={e.date}>{e.date}</th>
                );
              })}
            </tr>
            <tr>
              <th>Hour</th>
              {queue_statistics.result[0].stats.map((e) => {
                return (
                  [<th className="notfixed" style={{ minWidth: 100, maxWidth: 100 }}>Answered</th>, <th style={{ minWidth: 100, maxWidth: 100 }}>Unanswered</th>, <th style={{ minWidth: 100, maxWidth: 100 }}>Answered within SLA</th>]
                );
              })}
            </tr>
          </thead>
          <tbody>
            {
              queue_statistics.result.map((res) => {
                return <tr>
                  <th className="text-center">{res.hour}</th>
                  {res.stats.map((e) => {
                    return (
                      [<td className="text-right">{e.answered}</td>, <td className="text-right">{e.unanswered}</td>, <td className="text-right">{e.answered_sla}</td>]
                    );
                  })}
                </tr>
              })
            }
          </tbody>
        </Table>
      </div>
    );
  }
}

function mapStateToProps({ queue_statistics }) {
  return {
    queue_statistics,
  };
}
export default connect(mapStateToProps, null)(ActivityTable);
