import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateConfig from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash'; // Import lodash if not already imported

import { listAgentBreakConfig } from '../../../../../actions/configurations';
import { checkPermission } from '../../../../../config/util';
import Loader from '../../../../../components/Loader';
import { loadAgentActivities } from '../../../../../actions/reports';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config: null,
            subConfig: null,
            userReadAccess: false,
            userWriteAccess: false,
            expandedRow: null,
            expandedSubstatuses: [], // Track expanded substatuses by statusId
        };
    }

    componentWillMount() {
        this.props.listAgentBreakConfig();
        this.props.loadAgentActivities();
        this.setState({ userReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ userWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleEditRow(row) {
        this.setState({ config: row });
    }

    render() {
        const { agent_activities } = this.props;

        if (!agent_activities) {
            return <Loader />;
        }

        const getClassByStatus = (cellContent) => {
            if (cellContent) {
                const status = _.find(agent_activities, (s) => {
                    return s.color.toLowerCase() === cellContent.toLowerCase();
                });
                if (status) {
                    return `col-status bg-${status.color}`;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        };

        const columns = [
            {
                dataField: 'status_id',
                text: 'Status ID',
                headerStyle: {
                    width: 60
                },
            }, {
                dataField: 'status_3cx',
                text: '3CX Status Name',
                headerStyle: {
                    width: 160
                },
            }, {
                dataField: 'status_name',
                text: 'Display Name',
                headerStyle: {
                    width: 160
                },
            }, {
                dataField: 'color',
                text: 'Color',
                headerStyle: {
                    width: 130
                },
                align: 'center',
                classes: (cell, row) => {
                    return getClassByStatus(cell);
                },
                formatter: (cell, row) => {
                    return cell;
                }
            }, {
                dataField: 'approved_time',
                text: 'Approved Time',
                headerStyle: {
                    width: 160
                },
            },
            {
                dataField: 'substatus',
                text: 'Sub Status',
                formatter: (cell, row) => {
                    return <ul>
                        {cell.map((substatus, index) => {
                            return <li>{substatus.sub_status_name} <small>{substatus.approved_time}</small></li>
                        })}
                    </ul>
                },
            }, , {
                dataField: 'status_id',
                text: '',
                headerStyle: {
                    width: 80
                }, hidden: !this.state.userWriteAccess,
                formatter: (cellContent, row) => {
                    return (
                        <div className="d-flex justify-content-around">
                            <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title={"Edit"}  ><i className="fa fa-pencil" ></i></Button>
                        </div>
                    );
                }
            }];


        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Agent Status</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.userReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Agent Status</CardHeader>
                            <CardBody>
                                {agent_activities ?
                                    <BootstrapTable
                                        keyField='login_id'
                                        data={agent_activities}
                                        columns={columns}
                                    /> : ""
                                }
                            </CardBody>
                        </Card> : null}
                        {this.state.userWriteAccess && this.state.config ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>Edit Configurations</CardHeader>
                            <CreateConfig config={this.state.config} onClose={() => this.setState({ config: null })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ agent_activities }) {
    return {

        agent_activities
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listAgentBreakConfig,
        loadAgentActivities
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Users));
