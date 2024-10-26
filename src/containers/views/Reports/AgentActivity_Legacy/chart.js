import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDuration } from "../../../../config/util";

const colors = {
  "GREEN": "#018839",
  "BROWN": "#8f5b0d",
  "YELLOW": "#f1c40f",
  "LIGHT_GREEN": "#59d864",
  "LIGHT_RED": "#f08172",
  "ORANGE": "#e67e22",
  "RED": "#e62f22",
  "white": "#dadada",
};

class ActivityCharts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Duration: true,
      Count: true
    }
  }

  renderBars(type, axis) {
    return  this.props.agent_activities.map(status => {
      return (<Bar key={type + ": " + status.id} dataKey={type + ": " + status.status_name} yAxisId={axis} stackId={type} fill={colors[status.color_desc]} />);
    });
  }


  renderLegend() {
    return this.props.agent_activities.map(status => {
      return { value: status.status_name, type: 'rect', color: colors[status.color_desc], id: "Count: " + status.id };
    });
  }

  renderTooltipData(data) {

  }

  renderTooltip(data) {

    if (data.payload) {
      var tooltipData = {};
      var cols = {};
      // console.log(data.payload);
      data.payload.map(d => {
        var val = d.name.split(": ");

        if (!tooltipData[val[1]]) {
          tooltipData[val[1]] = {};
        }
        cols[val[0]] = true;
        tooltipData[val[1]][val[0]] = d.value;
        return val;
      });

      var table = [];

      // console.log(tooltipData);
      for (var k in tooltipData) {
        table.push(
          <tr key={k}>
            <td >{k}</td>
            <td className="text-right">{tooltipData[k]["Count"]}</td>
            <td className="text-right">{formatDuration(tooltipData[k]["Duration"])}</td>
          </tr>
        );
      }

      return (
        <div className="bg-white">
          <Table size="sm">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {table}
            </tbody>
          </Table>
        </div>
      );
    } else {
      return "";
    }


  }

  render() {
    const { agent_activity_report } = this.props;
    const tickFormatter = (tick) => formatDuration(tick);

    if (agent_activity_report.length === 0) {
      return "Please generate the report";
    }

    var data = [];

    agent_activity_report.map(agent => {
      var val = {};
      val.name = agent.agentName;
      agent.Data.map(status => {
        val["Count: " + status.statusName] = status.totalCount;
        val["Duration: " + status.statusName] = status.totalDuration;
        val.summary = `${status.statusName} Count: ${status.totalCount}, Duration:  ${formatDuration(status.totalDuration)}`;
        return "";
      });
      data.push(val);
      return "";
    });
    // console.log(data);

    return (
      <div className="sticky-table">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={600} height={300} data={data}
            margin={{ top: 50, right: 30, left: 30, bottom: 100 }}>
            <XAxis interval={0} angle={90} textAnchor="start" dataKey="name" />
            <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'left' }} />
            <YAxis yAxisId="right" tickFormatter={tickFormatter} type='number' scale='time' label={{ value: 'Duration', angle: 90, position: 'right' }} orientation="right" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={this.renderTooltip} wrapperStyle={{ fontSize: '0.8em' }} />
            <Legend layout="horizontal" verticalAlign="top" align="center" payload={this.renderLegend()} />
            {this.renderBars("Count", "left")}
            {this.renderBars("Duration", "right")}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

function mapStateToProps({ agent_activity_report, agent_activities }) {
  return {
    agent_activity_report,
    agent_activities
  };
}
export default connect(mapStateToProps, null)(ActivityCharts);
