import React, { Component } from "react";
import { connect } from "react-redux";
import { Progress } from "reactstrap";
import _ from "lodash";

class KPITable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      max: [],
      min: [],
      selected: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.kpi_report !== prevProps.kpi_report) {
      const { kpi_report } = this.props;
      let max_kpi = [];
      let min_kpi = [];

      _.map(kpi_report, (extension) => {
        _.map(extension.KPI_List, (l) => {
          if (!max_kpi[l.kpi_code] || max_kpi[l.kpi_code] < l.kpi_value) {
            max_kpi[l.kpi_code] = l.kpi_value;
          }
          if (!min_kpi[l.kpi_code] || min_kpi[l.kpi_code] > l.kpi_value) {
            min_kpi[l.kpi_code] = l.kpi_value;
          }
        });
      });

      this.setState({ max: max_kpi, min: min_kpi });
    }
  }

  renderGraph(list) {
    console.log(list);
    return list.map((l, i) => {
      const score = ((l.kpi_value - this.state.min[l.kpi_code] + 1) / (this.state.max[l.kpi_code] - this.state.min[l.kpi_code] + 1)) * 100;
      return (
        <div key={l.kpi_code} className={`d-flex flex-row align-items-center p-1 ${i % 2 === 0 && "bg-light"}`}>
          <div
            onClick={() => {
              this.setState({ selected: l.kpi_code });
            }}
            style={{ width: 200, cursor: "pointer" }}
          >
            {l.kpi_name}
          </div>
          <div className="flex-fill">
            {" "}
            <Progress
              className="progress-xs"
              // style={{ opacity: `${score + 10}%` }}
              color={
                l.kpi_code === this.state.selected ? "secondary" : "primary"
              }
              value={score}
            />
          </div>
          <div style={{ textAlign: "right", width: 100 }}>{l.kpi_value}</div>
          {/* <div>
            <Button size="xs" outline className="ml-3" color="primary"><i className="fa fa-caret-up" ></i></Button>
            <Button size="xs" outline className="ml-1" color="primary"><i className="fa fa-caret-down" ></i></Button>
          </div> */}
        </div>
      );
    });
  }

  render() {
    const { kpi_report } = this.props;

    if (!kpi_report) {
      return "Please generate the report";
    }

    return (
      <div>
        {kpi_report.map((e) => {
          return (
            <div
              key={e.extension}
              className="d-flex flex-row border-bottom align-items-center"
            >
              <div style={{ width: 50 }}>{e.extension}</div>
              <div className="flex-fill">{this.renderGraph(e.KPI_List)}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps({ kpi_report }) {
  return {
    kpi_report,
  };
}
export default connect(mapStateToProps, null)(KPITable);
