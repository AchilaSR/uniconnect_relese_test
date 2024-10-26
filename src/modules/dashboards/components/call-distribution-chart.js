import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index } from '../../call-distribution/action';
import Loader from '../../../components/Loader';
import { Bar } from 'react-chartjs-2';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import moment from 'moment';
import { list3cxGroups } from '../../../actions/configurations';


const primary = getStyle('--secondary');
const secondary = getStyle('--info');

class HourlyDistributionChart extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {
            scale: "",
            hidden: [false, false, false, false],
            call_distribution: []
        };
    }

    componentWillMount() {
        this.props.list3cxGroups();
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    loadData() {
        const { queues_in_monitor = [], groups_in_monitor = [], exclude_interval, queues, agent_groups } = this.props;

        if ((!queues && !queues_in_monitor.length) || (!agent_groups && !groups_in_monitor.agent_groups)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }

        this.props.loadDistribution({
            "queues_in_monitor": queues_in_monitor.length ? queues_in_monitor : null,
            "groups_in_monitor": groups_in_monitor.length ? agent_groups.filter((q) => groups_in_monitor.indexOf(q.id) > -1).map((q) => (q.extensions)).flat(1) : null,
            "filter": exclude_interval,
            "date": moment(process.env.REACT_APP_DASHBOARD_DATE).startOf('d').format("YYYY-MM-DD"),
            "time_scale": 'hour'
        }, (call_distribution) => {
            this.setState({ call_distribution })
        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        const { call_distribution } = this.state;

        if (!call_distribution) {
            return <Loader />;
        }

        const labels = call_distribution.map((data) => moment(data.time_period).format('h A'));

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                onClick: (a, { datasetIndex, hidden }) => {
                    this.state.hidden[datasetIndex] = !hidden;
                    this.setState({ hidden: [...this.state.hidden] })
                }
            },
            animation: {
                duration: 0, // Disable animations
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Call Distribution',
                },
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Hour"
                    }
                }],
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ],
            },
        };

        const data = {
            labels,
            datasets: [
                {
                    label: `Inbound Answered (${call_distribution.reduce((a, data) => a + (parseInt(data.inbound_answered) || 0), 0)})`,
                    data: call_distribution.map((data) => data.inbound_answered),
                    backgroundColor: hexToRgba(primary, 50),
                    stack: "Inbound",
                    borderColor: primary,
                    borderWidth: 1,
                    hidden: this.state.hidden[0]
                },
                {
                    label: `Inbound Unanswered (${call_distribution.reduce((a, data) => a + (parseInt(data.inbound_unanswered) || 0), 0)})`,
                    data: call_distribution.map((data) => data.inbound_unanswered),
                    backgroundColor: hexToRgba(primary, 25),
                    stack: "Inbound",
                    borderColor: primary,
                    borderWidth: 1,
                    hidden: this.state.hidden[1]
                },
                {
                    label: `Outbound Answered (${call_distribution.reduce((a, data) => a + (parseInt(data.outbound_answered) || 0), 0)})`,
                    data: call_distribution.map((data) => data.outbound_answered),
                    backgroundColor: hexToRgba(secondary, 50),
                    borderColor: secondary,
                    stack: "Outbound",
                    borderWidth: 1,
                    hidden: this.state.hidden[2]
                },
                {
                    label: `Outbound Unanswered (${call_distribution.reduce((a, data) => a + (parseInt(data.outbound_unanswered) || 0), 0)})`,
                    data: call_distribution.map((data) => data.outbound_unanswered),
                    backgroundColor: hexToRgba(secondary, 25),
                    stack: "Outbound",
                    borderColor: secondary,
                    borderWidth: 1,
                    hidden: this.state.hidden[3]
                },
            ],
        };


        return <div className='mb-3' style={{ cursor: 'default' }
        }>
            <div className="chart-wrapper" style={{ height: (this.props.height * 15) - 80 }}>
                <Bar options={options} data={data} />
            </div>
        </div >;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadDistribution: index,
        list3cxGroups
    }, dispatch);
}

function mapStateToProps({ queues, groups_3cx }) {
    return {
        queues,
        agent_groups: groups_3cx
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(HourlyDistributionChart));