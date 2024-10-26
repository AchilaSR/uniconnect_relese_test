import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../../components/Loader';
import { getAgentMonitorData, loadAgentActivities, approveStatusRequest, loadAgents } from '../../../../actions/reports';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import CreateReport from './create';
import Fullscreen from "react-full-screen";
import { formatDateTime, formatDuration, formatTimeToSeconds } from '../../../../config/util';
import { AGENT_STATUS_REFRESH, GET_LOGIN_TIME_FROM_3CX } from '../../../../config/globals';
import Countdown from '../../../../components/Countdown';
import LineStatus from '../../../../modules/line-status/views/LineStatus';
import StatusSummary from './StatusSummary';
import CallCantrol from '../../../../modules/call-control/views/index';
import Modal from '../../../../components/Modal';
class Dial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            filtered_data: [],
            transferMode: false,
        }
    }

    componentWillMount() {
        this.props.loadAgentActivities();
        this.props.loadAgents();
    }

    componentDidUpdate(prevProps, prevStates) {
        if (JSON.stringify(prevProps.agent_monitor_data) !== JSON.stringify(this.props.agent_monitor_data) || prevStates.extensions !== this.state.extensions || prevStates.statuses !== this.state.statuses || prevStates.is_oncall !== this.state.is_oncall) {
            const filtered_data = (this.props.agent_monitor_data || []).filter((a) => {
                // const nameMatching = (a.agent_name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1 || a.agent_extension.indexOf(this.state.search) > -1)
                let nameMatching = true;

                if (this.state.extensions && this.state.extensions.length > 0) {
                    nameMatching = this.state.extensions.indexOf(a.agent_extension) > -1;
                }

                let statusMatching = true;

                if (this.state.statuses) {
                    statusMatching = _.find(this.state.statuses, { status_name: a.current_status_name });
                }

                let isOnCallMatching = true;

                if (this.state.is_oncall) {
                    isOnCallMatching = a.line_status && a.line_status.id;
                }

                return nameMatching && statusMatching && isOnCallMatching;
            })

            this.setState({ filtered_data, timer: 0 })
        }
    }

    handlePhoneStatusClick = (row) => {
        this.setState({ transferMode: row });
    };

    render() {
        const { agent_monitor_data, agent_activities } = this.props;
        if (!agent_activities) {
            return <Loader />;
        }

        const { filtered_data } = this.state;

        const getClassByStatus = (cellContent) => {
            if (cellContent) {
                const status = _.find(agent_activities, (s) => {
                    return s.status_name.toLowerCase() === cellContent.toLowerCase()
                });
                if (status) {
                    return `col-status bg-${status.color_desc}`;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }

        const columns = [{
            dataField: 'agent_name',
            text: 'Agent Name',
            headerStyle: {
                width: 85
            },
            sort: true
        }, {
            dataField: 'agent_extension',
            text: 'Extension',
            headerStyle: {
                width: 85
            },
            align: 'center',
            sort: true
        }, {
            dataField: 'agent_extension',
            text: 'Phone Status',
            headerStyle: {
                width: 85
            },
            formatter: (cell, row) => {
                if (row.line_status && row.line_status.id) {
                    return <div className='cursor' onClick={() => this.handlePhoneStatusClick(row)}><LineStatus extension={cell} /></div>
                } else {
                    return <LineStatus extension={cell} />
                }
            },
            align: 'center'
        }, {
            dataField: 'current_status_name',
            text: 'Current Status',
            headerStyle: {
                width: 85
            },
            align: 'center',
            classes: (cell, row) => {
                return getClassByStatus(cell)
            },
            sort: true
        }, {
            dataField: 'current_sub_status',
            text: 'Sub Status',
            headerStyle: {
                width: 85
            },
            align: 'center',
            classes: getClassByStatus,
            sort: true
        }, {
            dataField: 'approved_duration',
            text: 'Approved Duration',
            headerStyle: {
                width: 85
            },
            align: 'center',
            sort: true
        }, {
            dataField: 'ellapsed_duration_sec',
            text: 'Elapsed Duration',
            headerStyle: {
                width: 85
            },
            align: 'center',
            formatter: (cell, row) => {
                return <Countdown time={cell} />
            },
            sort: true
        }, {
            dataField: 'exceeded_duration_sec',
            text: 'Exceeded Duration',
            headerStyle: {
                width: 85
            },
            align: 'center',
            classes: 'text-danger',
            formatter: (cell, row) => {
                if (formatTimeToSeconds(row.approved_duration) > 0) {
                    return <Countdown time={cell} />
                }
                return "";
            },
            sort: true
        }, {
            dataField: 'last_logged_in_time',
            text: 'Login Time',
            headerStyle: {
                width: 100
            },
            align: 'center',
            formatter: (cell) => {
                return formatDateTime(cell)
            },
            hidden: GET_LOGIN_TIME_FROM_3CX,
            sort: true
        }, {
            dataField: 'last_logged_out_time',
            text: 'Last Active Time',
            headerStyle: {
                width: 100
            },
            align: 'center',
            formatter: (cell, row) => {
                return formatDateTime(cell || row.status_changed_on)
            },
            hidden: GET_LOGIN_TIME_FROM_3CX,
            sort: true
        }, {
            dataField: 'last_available_time',
            text: 'Login Time',
            headerStyle: {
                width: 100
            },
            align: 'center',
            formatter: (cell) => {
                return formatDateTime(cell)
            },
            hidden: !GET_LOGIN_TIME_FROM_3CX,
            sort: true
        }, {
            dataField: 'status_changed_on',
            text: 'Status Changed Time',
            headerStyle: {
                width: 100
            },
            align: 'center',
            formatter: (cell) => {
                return formatDateTime(cell)
            },
            hidden: !GET_LOGIN_TIME_FROM_3CX,
            sort: true
        }];


        const sizePerPageRenderer = ({
            options,
            currSizePerPage,
            onSizePerPageChange
        }) => (
            <div className="btn-group" role="group">
                {
                    options.map((option) => {
                        const isSelect = currSizePerPage === `${option.page}`;
                        return (
                            <button
                                key={option.text}
                                type="button"
                                onClick={() => onSizePerPageChange(parseInt(option.page))}
                                className={`btn btn-page ${isSelect ? 'btn-primary' : 'btn-outline-primary'}`}
                            >
                                {option.text}
                            </button>
                        );
                    })
                }
            </div>
        );

        const sizePerPageList = [...[10, 25, 50, 100].map(a => ({ text: a, value: a })), {
            text: 'All', value: filtered_data.length
        }]

        return (
            <div className="animated fadeIn" >
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Activity Monitor</li>
                    {filtered_data.length > 0 ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <a className="btn" onClick={() => this.setState({ isFull: true })}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3" style={{ width: 300, minWidth: 300 }}>
                            <Card>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport onSearchChange={(search) => this.setState(search)} />
                            </Card>
                        </div>
                        {agent_monitor_data ?
                            <div className="flex-grow-1">
                                <Fullscreen
                                    enabled={this.state.isFull}
                                    onChange={isFull => this.setState({ isFull })}
                                >
                                    <Card>
                                        <CardHeader>Report</CardHeader>
                                        <CardBody>
                                            {agent_monitor_data.length > 0 ?
                                                <StatusSummary /> : ""}
                                            {filtered_data.length > 0 ?
                                                <div>
                                                    <hr />
                                                    <BootstrapTable pagination={paginationFactory({ sizePerPageRenderer, sizePerPageList })} keyField='agent_extension' data={filtered_data} columns={columns} />
                                                </div> : ""}
                                        </CardBody>
                                    </Card>
                                </Fullscreen>
                            </div>
                            : <Card className="flex-grow-1">
                                <CardHeader>Report</CardHeader>
                                <CardBody>
                                    No data available
                                </CardBody>
                            </Card>}
                    </div>
                </div>

                <Modal toggle={() => { this.setState({ transferMode: false }) }} title="Handle Call" isOpen={this.state.transferMode}>
                    <CallCantrol onSuccess={() => this.setState({ transferMode: false })} data={this.state.transferMode} />
                </Modal>
            </div>
        );
    }
}


function mapStateToProps({ agent_monitor_data, agent_activities }) {
    return {
        agent_monitor_data,
        agent_activities
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAgentMonitorData,
        loadAgentActivities,
        approveStatusRequest,
        loadAgents
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);
