import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import { formatCurrency, formatDuration } from "../../../../config/util";
import { SHOW_WRAP_TIME } from "../../../../config/globals";

class ActivityTable extends Component {
  render() {
    const { agent_activity_report, showAdherence, showLogin } = this.props;

    if (agent_activity_report.length === 0) {
      return "No data available";
    }

    const columns = this.props.agent_activity_report[0].Data.map(({ status_id, statusName }) => ({ status_id, statusName }));

    return (
      <div className="sticky-table">
        <Table size="sm">
          <thead>
            <tr>
              <th>Agent</th>
              {columns.map((e) => {
                if (!SHOW_WRAP_TIME && e.status_id === 7) {
                  return null;
                }
                return (
                  <th colSpan="2" key={e.status_id}>{e.statusName}</th>
                );
              })}
              {showAdherence ? <th>Adherence</th> : ""}
              {showLogin ? <th>First Login Time</th> : ""}
              {showLogin ? <th>Last Active Time</th> : ""}
              <th colSpan={2}>Total</th>
            </tr>
          </thead>
          <tbody>
            {agent_activity_report.map((agent) => {
              var data = [];
              var totalCount = 0;
              var totalDuration = 0;


              agent.Data.map(status => {
                data[status.status_id] = { Duration: formatDuration(status.totalDuration), Count: status.totalCount, _dur: status.totalDuration };
                if (status.statusName !== "Login") {
                  totalCount += status.totalCount;
                  totalDuration += status.totalDuration;
                }
                return "";
              });

              let adherence;
              if (data[5] && data[7]) {
                adherence = (totalDuration - data[5]._dur - data[7]._dur) / (totalDuration - data[5]._dur);
              }

              return (
                <tr key={agent.agentExtension}>
                  <th>{agent.agentExtension}: {agent.agentName}</th>
                  {
                    columns.map(status => {
                      if (!SHOW_WRAP_TIME && status.status_id === 7) {
                        return null;
                      }
                      return (
                        ["Duration", "Count"].map(val => {
                          return (
                            <td className="text-right" key={agent.agent_id + val + status.status_id}>{data[status.status_id] ? data[status.status_id][val] : 0}</td>
                          );
                        })
                      );
                    })
                  }
                  {showAdherence ? <th className="text-right" >{formatCurrency(adherence)}</th> : ""}
                  {showLogin ? <td>{agent.firstLoginTime}</td> : ""}
                  {showLogin ? <td>{agent.lastLogoutTime}</td> : ""}
                  <th className="text-right" >{formatDuration(totalDuration)}</th>
                  <th className="text-right" >{totalCount}</th>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}

function mapStateToProps({ agent_activity_report }) {
  return {
    agent_activity_report,
  };
}
export default connect(mapStateToProps, null)(ActivityTable);
