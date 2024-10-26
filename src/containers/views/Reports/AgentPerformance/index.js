import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button, ButtonGroup, ButtonToolbar, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, } from 'reactstrap';
import { Bar } from 'react-chartjs-2';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import Fullscreen from "react-full-screen";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../../../components/Loader';

import { getDateRange } from '../../../../utils/common.js';
import { loadAgentPerformance } from '../../../../actions/reports';

import LeaderBoard from './leaderboard';
import { list3cxGroups } from '../../../../actions/configurations.js';

const primary = getStyle('--primary');
const secondary = getStyle('--secondary');

const mainChartOpts = {
    responsive: true,
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
        display: true,
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    drawOnChartArea: false,

                },
                ticks: {
                    autoSkip: false,
                    stepSize: 5,
                    minRotation: 90
                },
            }],
        yAxes: [
            {
                type: 'linear',
                display: true,
                position: 'right',
                label: "Score",
                id: 'y1',
                labels: {
                    show: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Score'
                },
            },
            {
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y2',
                gridLines: {
                    drawOnChartArea: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Points'
                },
            }
        ]
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

class AgentPerformance extends Component {
    constructor(props) {
        super(props);
        this.state = { isFull: false, type: 'Weekly', dropdownOpen: false };
        this.chart = React.createRef();
    }

    componentDidMount() {
        this.props.list3cxGroups();
        this.props.loadAgentPerformance();
    }

    componentDidUpdate() {
        if (!this.state.group && this.props.groups_3cx) {
            this.setState({ group: this.props.groups_3cx[0] })
        }
    }

    goFull = () => {
        this.setState({ isFull: true });
    }

    getChart() {
        const agent_performance = this.props.agent_performance[this.state.type].filter((a) => {
            return this.state.group.extensions.indexOf(a.extension) > -1
        }).sort((a, b) => b.points - a.points);

        if (!agent_performance || !agent_performance.length) {
            return {};
        }

        const highest = Math.ceil(agent_performance[0].points);

        const points = [];
        const score = [];
        const lables = [];

        for (var i = 0; i < Math.min(agent_performance.length, 25); i++) {
            score.push(agent_performance[i].score);
            points.push((agent_performance[i].points / highest * 100).toFixed(2));
            lables.push(agent_performance[i].agent_name);
        }

        const mainChart = {
            labels: lables,
            datasets: [
                {
                    label: 'Points',
                    backgroundColor: hexToRgba(secondary, 10),
                    borderColor: secondary,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 1,
                    data: points,
                    yAxisID: 'y2',
                },
                {
                    label: 'Score',
                    backgroundColor: hexToRgba(primary, 10),
                    borderColor: primary,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 1,
                    data: score,
                    yAxisID: 'y1',
                }
            ],
        };
        return mainChart;
    }

    render() {
        if (!this.props.agent_performance || !this.state.group) {
            return <Loader />;
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Agent Performance</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <a className="btn" onClick={this.goFull}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                        </div>
                    </li>
                </ol>
                <Fullscreen
                    enabled={this.state.isFull}
                    onChange={isFull => this.setState({ isFull })}
                >
                    <div className="container-fluid">
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        <Row>
                                            <Col sm="5">
                                                <CardTitle className="mb-0">Agent Performance</CardTitle>
                                                <div className="small text-muted">{getDateRange(this.state.type)}</div>
                                            </Col>

                                            <Col sm="7" className="d-none d-sm-inline-block">
                                                <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                                                    <ButtonDropdown className='mr-3' isOpen={this.state.dropdownOpen} toggle={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}>
                                                        <DropdownToggle caret>
                                                            {this.state.group.name}
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            {this.props.groups_3cx.map((group) =>
                                                                <DropdownItem onClick={() => this.setState({ group: group })} >{group.name}</DropdownItem>
                                                            )}
                                                        </DropdownMenu>
                                                    </ButtonDropdown>
                                                    <ButtonGroup aria-label="First group">
                                                        <Button color="outline-secondary" onClick={() => this.setState({ type: "Weekly" })} active={this.state.type === "Weekly"}>Week</Button>
                                                        <Button color="outline-secondary" onClick={() => this.setState({ type: "Monthly" })} active={this.state.type === "Monthly"}>Month</Button>
                                                        <Button color="outline-secondary" onClick={() => this.setState({ type: "Annually" })} active={this.state.type === "Annually"}>Year</Button>
                                                    </ButtonGroup>
                                                </ButtonToolbar>
                                            </Col>
                                        </Row>
                                        <div className="chart-wrapper" style={{ height: 300 + 'px', marginTop: 40 + 'px' }}>
                                            <Bar ref={this.chart} data={this.getChart()} options={mainChartOpts} height={300} />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4" sm="12">
                                <LeaderBoard type="week" data={this.props.agent_performance.Weekly.filter((a) => {
                                    return this.state.group.extensions.indexOf(a.extension) > -1
                                })} />
                            </Col>
                            <Col md="4" sm="12">
                                <LeaderBoard type="month" data={this.props.agent_performance.Monthly.filter((a) => {
                                    return this.state.group.extensions.indexOf(a.extension) > -1
                                })} />

                            </Col>
                            <Col md="4" sm="12">
                                <LeaderBoard type="year" data={this.props.agent_performance.Annually.filter((a) => {
                                    return this.state.group.extensions.indexOf(a.extension) > -1
                                })} />
                            </Col>
                        </Row>
                    </div>
                </Fullscreen>
            </div>
        );
    }
}

function mapStateToProps({ agent_performance, groups_3cx }) {
    return {
        agent_performance,
        groups_3cx
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgentPerformance,
        list3cxGroups
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AgentPerformance);