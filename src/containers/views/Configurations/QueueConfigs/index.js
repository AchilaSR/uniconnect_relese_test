import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateUser from './create';
import Filter from './filter';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import { viewAgentQueueConfigurations } from '../../../../actions/users';
import Loader from '../../../../components/Loader';
import { checkPermission } from '../../../../config/util';
import { listQueues } from '../../../../actions/configurations';

const priorities = {
    1: { label: "Very Low", class: "bg-very-bad" },
    2: { label: "Low", class: "bg-bad" },
    3: { label: "Medium", class: "bg-satisfied" },
    4: { label: "High", class: "bg-good" },
    5: { label: "Very High", class: "bg-excellent" }
}

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataset: null,
            acReadAccess: false,
            acWriteAccess: false,
            sidePanel: "filter",
            filter: {}
        }
    }

    componentWillMount() {
        this.props.viewAgentQueueConfigurations();
        this.props.listQueues();
        this.setState({ acReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ acWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    getFilteredData() {
        const filteredData = [];

        this.props.queue_configs.map((config) => {
            let valid = true;

            if (this.state.filter.agent_ext && config.agent_ext !== this.state.filter.agent_ext) {
                valid = false;
            }

            if (this.state.filter.priority && config.priority !== this.state.filter.priority) {
                valid = false;
            }

            if (this.state.filter.assigned_queues) {
                if (config.assigned_queues.indexOf(this.state.filter.assigned_queues) < 0) {
                    valid = false;
                }
            }

            if (valid) {
                filteredData.push(config);
            }
        })

        return filteredData;
    }

    render() {
        const { queue_configs, queues } = this.props;

        if (!queue_configs || !queues) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'agent_name',
            text: 'Name'
        }, {
            dataField: 'agent_ext',
            text: 'Extension'
        }, {
            dataField: 'assigned_queues',
            text: 'Queues',
            formatter: (cellContent, row) => {
                return _.map(cellContent, (a) => {
                    return _.find(queues, { extension: a }).display_name
                }).join(", ");
            }
        }, {
            dataField: 'priority',
            text: 'Priority',
            headerStyle: {
                width: 100
            },
            classes: (cellContent, row) => {
                return `rating text-center ${priorities[cellContent].class}`
            },
            formatter: (cellContent, row) => {
                return priorities[cellContent].label;
            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Queue Configurations</li>
                    <li className="breadcrumb-menu">


                        <div className="btn-group">
                            {this.state.sidePanel === "filter" ?
                                <button onClick={() => this.setState({ sidePanel: "config" })} className="btn"><i className="fa fa-cog"></i> Configure</button> :
                                <button onClick={() => this.setState({ sidePanel: "filter" })} className="btn"><i className="fa fa-filter"></i> Filter</button>
                            }
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.acReadAccess && this.state.sidePanel === "filter" ? <Card className="mr-3" style={{ width: 300 }}>
                            <CardHeader>Filter</CardHeader>
                            <Filter onFilter={(filter) => { this.setState({ filter }) }} />
                        </Card> : null}
                        {this.state.acReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Queue Configurations</CardHeader>
                            <CardBody>
                                <BootstrapTable keyField='agent_id' data={this.getFilteredData()} columns={columns} />
                            </CardBody>
                        </Card> : null}
                        {this.state.acWriteAccess && this.state.sidePanel !== "filter" ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>Configuration</CardHeader>
                            <CreateUser onClose={() => this.setState({ sidePanel: "filter" })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ queue_configs, queues }) {
    return {
        queue_configs,
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        viewAgentQueueConfigurations,
        listQueues
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Users));
