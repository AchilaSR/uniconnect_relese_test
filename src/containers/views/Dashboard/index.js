import React, { Component } from 'react';
import { Card, CardBody, CardFooter, Col, Row } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import TimeRangeSlider from 'react-time-range-slider';
import Fullscreen from "react-full-screen";
import { getCallCounts } from '../../../actions/dashboard';
import { DASHBOARD_GRAPH_TYPE, DASHBOARD_REFRESH_INTERVAL } from '../../../config/globals';
import { formatCurrency } from '../../../config/util';
import PopupWindow from '../../../components/Popup';

const primary = getStyle('--primary')

const minutes = (time) => {
    time = time.replace(".", ":");
    let val = time.split(":");
    let min = (parseInt(val[0], 10) * 60) + parseInt(val[1], 10);
    return min;
}

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.timeChangeHandler = this.timeChangeHandler.bind(this);
        this.state = {
            value: {
                start: "08:00",
                end: "18:00"
            },
            isFull: false,
            showPopup: false,
        }
    }

    componentWillMount() {
        this.props.getCallCounts();
        this.refreshInterval = window.setInterval(() => {
            this.props.getCallCounts();
        }, DASHBOARD_REFRESH_INTERVAL * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    timeChangeHandler(time) {
        this.setState({
            value: time
        });
    }

    getChart() {
        const call_counts = this.props.call_counts.call_count_distribution || [];
        const data = [];
        const lables = [];
        const start = minutes(this.state.value.start);
        const end = minutes(this.state.value.end);

        for (var i = 0; i < call_counts.length; i++) {
            const time = minutes(call_counts[i].time);
            if (time >= start && time <= end) {
                data.push(call_counts[i].count);
                lables.push(call_counts[i].time);
            }
        }

        const mainChart = {
            labels: lables,
            datasets: [
                {
                    label: 'Call Counts',
                    backgroundColor: hexToRgba(primary, 10),
                    borderColor: primary,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 2,
                    data: data,
                }
            ],
        };

        return mainChart;
    }

    render() {
        const call_counts = this.props.call_counts;

        if (!call_counts) {
            return <Loader />
        }

        const data = this.getChart();

        let max = Math.max(...data.datasets[0].data);
        const base = Math.floor(Math.log10(max));
        max = Math.ceil(max / (10 ** base)) * (10 ** base) + (10 ** base);

        const mainChartOpts = {
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                intersect: true,
                mode: 'index',
                position: 'nearest',
                callbacks: {
                    labelColor: function (tooltipItem, chart) {
                        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
                    }
                }
            },
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [
                    {
                        gridLines: {
                            drawOnChartArea: false,
                        },
                    }],
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 10,
                            stepSize: 10 ** base,
                            max: max,
                        },
                    }],
            },
            elements: {
                point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                    hoverBorderWidth: 3,
                },
            },
        };

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Dashboard</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <a className="btn" onClick={() => this.setState({ showPopup: true })}><i className="fa fa-window-restore"></i> Open in New Window</a>
                            <a className="btn" onClick={() => this.setState({ isFull: true })}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                        </div>
                    </li>
                </ol>
                <Fullscreen
                    enabled={this.state.isFull}
                    onChange={isFull => this.setState({ isFull })}
                >
                    <PopupWindow enabled={this.state.showPopup} closeWindowPortal={() => { this.setState({ showPopup: false }) }}>
                        <div className="container-fluid">
                            <Row>
                                <Col>
                                    <Card>
                                        <CardBody>
                                            <Row>
                                                <Col>
                                                    <h1 className="mb-0">Call Distribution ({DASHBOARD_GRAPH_TYPE})</h1>
                                                </Col>
                                                <Col className='text-right pt-3'>
                                                    Total Call Count: {formatCurrency(call_counts.totalcount, 0)}
                                                </Col>
                                            </Row>
                                            <div className="chart-wrapper">
                                                <Line data={this.getChart()} options={mainChartOpts} height={300} />
                                            </div>
                                        </CardBody>
                                        <CardFooter>
                                            <div className="d-flex align-content-end flex-wrap p-3">
                                                <div>
                                                    {this.state.value.start}
                                                </div>
                                                <div className="flex-fill px-3">
                                                    <TimeRangeSlider
                                                        disabled={false}
                                                        draggableTrack={true}
                                                        format={24}
                                                        maxValue={"23:59"}
                                                        minValue={"00:00"}
                                                        name={"time_range"}
                                                        onChange={this.timeChangeHandler}
                                                        step={15}
                                                        value={this.state.value} />
                                                </div>
                                                <div>
                                                    {this.state.value.end}
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </PopupWindow>
                </Fullscreen>
            </div >
        );
    }
}

function mapStateToProps({ call_counts }) {
    return {
        call_counts
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getCallCounts
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
