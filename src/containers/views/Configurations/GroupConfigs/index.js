import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateGroup from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import { loadConfig, deleteConfig } from '../../../../actions/groups';
import Loader from '../../../../components/Loader';
import { checkPermission } from '../../../../config/util';

class Groups extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gcReadAccess: false,
            gcWriteAccess: false,
            showForm: false
        };
    }

    componentWillMount() {
        this.props.loadConfig();
        this.setState({ gcReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ gcWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    deleteConfig(id) {
        if (window.confirm("Are you sure, you want to delete the configuration?")) {
            this.props.deleteConfig(id);
        }
    }

    render() {
        const { group_configs } = this.props;

        if (!group_configs) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'group_name',
            text: 'Name'
        }, {
            dataField: 'campaignid_list',
            text: 'Campaigns',
            formatter: (cellContent, row) => {
                return _.map(cellContent, 'campaignName').join(", ");
            }
        }, {
            dataField: 'dialingMode',
            text: 'Dialing Mode',
            formatter: (cellContent, row) => {
                return cellContent ? "Auto" : "Manual";
            }
        }, {
            dataField: 'group_id',
            text: '',
            headerStyle: {
                width: 60
            }, hidden: !this.state.gcWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.deleteConfig(cellContent)} color="danger"><i className="fa fa-trash" ></i></Button>
                    </div>
                );

            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Group Configurations</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <button onClick={() => this.setState({ showForm: true })} className="btn"><i className="fa fa-plus"></i> Add New</button>
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.gcReadAccess ? <div className="flex-grow-1">
                            <Card>
                                <CardHeader>Groups</CardHeader>
                                <CardBody>
                                    {group_configs.length ? <BootstrapTable keyField='group_id' data={group_configs} columns={columns} /> : "No Data Found"}
                                </CardBody>
                            </Card>
                        </div> : null}
                        {this.state.gcWriteAccess && this.state.showForm ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>Configurations</CardHeader>
                            <CreateGroup onClose={() => this.setState({ showForm: false })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ group_configs }) {
    return {
        group_configs
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadConfig,
        deleteConfig
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
