import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { connect } from 'react-redux';

const primary = getStyle('--primary');
const secondary = getStyle('--secondary');

const mainChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    mode: 'label'
  },
  elements: {
    line: {
      fill: false
    }
  },
  scales: {
    xAxes: [
      {
        display: true,
        gridLines: {
          display: false
        },
        ticks: {
          autoSkip: false,
          stepSize: 5,
          minRotation: 90
        },
      }
    ],
    yAxes: [
      {
        type: 'linear',
        display: true,
        position: 'left',
        id: 'y1',
        gridLines: {
          display: false
        },
        labels: {
          show: true
        }
      },
      {
        type: 'linear',
        display: true,
        position: 'right',
        id: 'y2',
        gridLines: {
          display: false
        },
        labels: {
          show: true
        },
        ticks: {
          callback: function (value, index, values) {
            return value + '%';
          }
        }
      }
    ]
  }
};

class ReportChart extends Component {
  constructor(props) {
    super(props);
    this.chart = React.createRef();
  }

  getChart() {
    const call_details = this.props.call_details;
    const abandoned = [];
    const offered = [];
    const lables = [];

    for (var i = 0; i < call_details.length; i++) {
      offered.push(call_details[i].offered_count);
      abandoned.push(call_details[i].abandonded_percentage.toFixed(2));
      lables.push(call_details[i].date);
    }

    const mainChart = {
      labels: lables,
      datasets: [
        {
          label: 'Offered',
          backgroundColor: hexToRgba(primary, 10),
          borderColor: primary,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 1,
          data: offered,
          yAxisID: 'y1',
        },
        {
          label: 'Abandaned %',
          type: 'line',
          backgroundColor: hexToRgba(secondary, 90),
          borderColor: secondary,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 1,
          data: abandoned,
          yAxisID: 'y2',
        }
      ]
    };

    return mainChart;
  }

  render() {
    if (!this.props.call_details) {
      return "Please generate the report";
    }

    return (
      <div className="chart-wrapper">
        <Bar ref={this.chart} data={this.getChart()} options={mainChartOpts} height={300} />
      </div>
    );
  }
}

function mapStateToProps({ call_details }) {
  return {
    call_details
  };
}

export default connect(mapStateToProps, null)(ReportChart);