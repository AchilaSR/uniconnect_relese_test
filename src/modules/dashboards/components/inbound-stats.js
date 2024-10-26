import React, { Component } from 'react';
import { formatCurrency } from '../../../config/util';
import { Row } from 'reactstrap';
import StatBox from './stat-box';
import GaugeChart from 'react-gauge-chart';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadInboundStats } from '../action';
import { getReportData } from '../../../config/util';
import { DASHBOARD_SHOW_3_RINGS, DASHBOARD_SLA_BASED_ON_ANSWERED } from '../../../config/globals';
import moment from 'moment';
import { getLineStatus } from '../../line-status/action';

class InboundStats extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = { waiting: 0, queued: 0, buzzer: false, buzzerStartTime: 0 };
    }

    async playAudio() {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const audio = new Audio('/alarm.wav');
            audio.play()
                .catch(error => {
                    console.error('Failed to play audio:', error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    componentWillMount() {
        this.loadData();
        this.loadQueue();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);

        this.refresh_interval_queue = setInterval(() => {
            this.loadQueue();
        }, 1000);
    }

    loadData() {
        const { queues_in_monitor = [], exclude_interval, queues } = this.props;
        if (!queues || (!queues.length && !queues_in_monitor.length)) {
            setTimeout(() => {
                this.loadData();
            }, 1000);
            return;
        }
        this.props.loadInboundStats({
            "queues": queues_in_monitor.length ? queues_in_monitor.join(" ") : null,
            date_range: {
                start: moment(process.env.REACT_APP_DASHBOARD_DATE).startOf('d').format("YYYY-MM-DD HH:mm:ss"),
                end: moment(process.env.REACT_APP_DASHBOARD_DATE).endOf('d').format("YYYY-MM-DD HH:mm:ss")
            },
            exclude_interval
        }, (err, data) => {
            if (data) {
                this.setState({
                    ...this.state,
                    ...data,
                    call_answer_rate: data.total_answered_calls / data.total_queue_calls_received * 100,
                    abandoned_calls: data.total_queue_calls_received - data.total_answered_calls,
                    abandoned_calls_rate: (data.total_queue_calls_received - data.total_answered_calls) / data.total_queue_calls_received * 100,
                });
            }
            this.props.onStateChange(getReportData(this.state));
        });
    }

    loadQueue() {
        const { queues_in_monitor = [], queues } = this.props;
        if (!queues || (!queues.length && !queues_in_monitor.length)) {
            setTimeout(() => {
                this.loadQueue();
            }, 1000);
            return;
        }

        this.props.getLineStatus(queues[0].extension, () => {
            let queued = 0;
            let answered = 0;

            let selected_queues = queues_in_monitor;

            if (!selected_queues.length) {
                let queued_calls = [];
                let answered_calls = [];

                if (this.props.queue_calls && this.props.queue_calls.queued) {
                    queued_calls = _.chain(this.props.queue_calls.queued)
                        .values()
                        .flatMap()
                        .value()
                }

                if (this.props.queue_calls && this.props.queue_calls.answered) {
                    answered_calls = _.chain(this.props.queue_calls.answered)
                        .values()
                        .flatMap()
                        .value()

                }

                queued = _.chain([...queued_calls]).filter((a) => a.status === 'ringing' && a.direction === 'inbound' && a.extension.length < 5)
                    .uniqBy('customer_number')
                    .size()
                    .value();

                answered = _.chain([...answered_calls, ...queued_calls]).filter((a) => a.status === 'oncall' && a.direction === 'inbound' && a.extension.length < 5)
                    .uniqBy('customer_number')
                    .size()
                    .value() - queued;
            } else {
                for (let i = 0; i < selected_queues.length; i++) {
                    if (this.props.queue_calls && this.props.queue_calls.queued && this.props.queue_calls.queued[selected_queues[i]]) {
                        queued += this.props.queue_calls.queued[selected_queues[i]].length;
                    }

                    if (this.props.queue_calls && this.props.queue_calls.answered && this.props.queue_calls.answered[selected_queues[i]]) {
                        answered += this.props.queue_calls.answered[selected_queues[i]].length;
                    }
                };
            }

            if (this.props.enableBuzzer) {
                if (queued > 0) {
                    if (this.state.buzzerStartTime === 0) {
                        this.setState({ buzzerStartTime: Date.now() })
                    } else if (Date.now() - this.state.buzzerStartTime >= parseInt(this.props.min_queue_wait) * 1000) {
                        this.setState({ buzzer: "danger" });
                        this.playAudio();
                    } else if (queued >= parseInt(this.props.min_customers_waiting)) {
                        this.setState({ buzzer: "danger" });
                        this.playAudio();
                    } else {
                        this.setState({ buzzer: "warning" })
                    }
                } else {
                    this.setState({ buzzer: false, buzzerStartTime: 0 })
                }
            }

            this.setState({ queued: queued + answered, waiting: queued })
        })
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
        clearInterval(this.refresh_interval_queue);
    }

    render() {
        let size = 3;

        switch (this.props.position.w) {
            case 1:
                size = 12;
                break;
            case 4:
                size = 2;
                break;
        }

        const sla = formatCurrency(this.state.answered_calls_within_sla / (DASHBOARD_SLA_BASED_ON_ANSWERED ? this.state.total_answered_calls : this.state.total_queue_calls_received) * 100);
        const dropped_sla = formatCurrency(this.state.unanswered_calls_within_sla / this.state.abandoned_calls * 100);
        return <div>
            <Row className="px-3">
                <div className={`px-1 col-${size > 6 ? size : DASHBOARD_SHOW_3_RINGS ? size * 1 : size * 2} mb-2`}>
                    <div className="stat-box bg-light rounded h-100 p-3">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h4>{sla}</h4>
                                <small className="text-muted">Service Level (%)</small>
                            </div>
                            <GaugeChart id="gauge-chart3"
                                nrOfLevels={5}
                                colors={["#dc3545", "#28a745"]}
                                arcWidth={0.3}
                                percent={(sla / 100) || 0}
                                hideText={true}
                                style={{ width: 100 }}
                                marginInPercent={0.01}
                                animate={false}
                            />
                        </div>
                    </div>
                </div>
                <StatBox size={size} value={this.state.total_queue_calls_received} label="Total Calls Received in Queue(s)" />
                <StatBox buzzer={this.state.buzzer} size={size} value={this.state.queued} sub_value={this.state.waiting ? this.state.waiting + " waiting" : ""} label="Calls in Queue(s)" />
                <StatBox size={size} value={this.state.total_answered_calls} sub_value={this.state.call_answer_rate ? `${formatCurrency(this.state.call_answer_rate)}%` : undefined} label="Total Answered Calls" />
                <StatBox size={size} value={this.state.answered_calls_within_sla} label="Answered Calls within SLA" />
                <StatBox size={size} inverseArrowColors={true} value={this.state.abandoned_calls} sub_value={this.state.abandoned_calls_rate ? `${formatCurrency(this.state.abandoned_calls_rate)}%` : undefined} label="Abandoned Calls" />
                {DASHBOARD_SHOW_3_RINGS ? <StatBox size={size} value={this.state.total_calls_answered_within_x_time} label="Answered Calls within 3 Rings" /> : ""}
                <StatBox size={size} inverseArrowColors={true} value={this.state.unanswered_calls_within_sla} sub_value={this.state.total_queue_calls_received ? `${formatCurrency(dropped_sla)}%` : undefined} label="Dropped calls within SLA" />
                <StatBox showArrow={false} inverseArrowColors={true} size={size} value={(this.state.longest_call_duration || "00:00:00").split(".")[0]} format={false} label="Longest Call" />
                <StatBox showArrow={false} inverseArrowColors={true} size={size} value={(this.state.average_handled_time || "00:00:00").split(".")[0]} format={false} label="Average Talking Time" />
                <StatBox showArrow={false} inverseArrowColors={true} size={size} value={(this.state.longest_waiting_duration || "00:00:00").split(".")[0]} format={false} label="Longest Waiting Time" />
                <StatBox showArrow={false} inverseArrowColors={true} size={size} value={(this.state.average_waiting_time || "00:00:00").split(".")[0]} format={false} label="Average Waiting Time" />
            </Row>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadInboundStats,
        getLineStatus
    }, dispatch);
}

function mapStateToProps({ queues, queue_calls, line_status }) {
    return {
        queues,
        queue_calls,
        line_status
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(InboundStats));