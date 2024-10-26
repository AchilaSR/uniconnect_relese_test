import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateGroup from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { listGroups, deleteGroup } from '../../../actions/groups';
import { checkPermission } from '../../../config/util'

class Groups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            group_name: "",
            group_description: "",
            group_id: "",
            createStatus: true,
            updateData: {},
            groupReadAccess: false,
            groupWriteAccess: false
        };
    }

    componentWillMount() {
        this.props.listGroups();
        this.setState({ groupReadAccess: checkPermission('User Management', 'READ') });
        this.setState({ groupWriteAccess: checkPermission('User Management', 'WRITE') });
    }

    handleEditRow(row) {
        this.setState({ updateData: row })
    }
    handleDeleteRow(row) {
        if(window.confirm("Are you sure you want to delete this group?")){
            this.props.deleteGroup(row.id);
        }
    }
    showGroups(groupList) {

        const groupArray = [];
        if (groupList) {
            for (let i = 0; i < groupList.length; i++) {
                let groupObject = {}
                groupObject.id = groupList[i].group_id;
                groupObject.group_name = groupList[i].group_name;
                groupObject.group_description = groupList[i].group_description;

                groupArray.push(groupObject);
            }
        }

        return groupArray;
    }

    render() {
        const { groups } = this.props;

        const columns = [{
            dataField: 'group_name',
            text: 'Group Name'
        }, {
            dataField: 'group_description',
            text: 'Group Description'
        },
        {
            dataField: 'group_id',
            text: '',
            headerStyle: {
                width: 120
            }, hidden: !this.state.groupWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
                        {/* <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary"><i className="fa fa-eye" ></i></Button> */}
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title='Delete'><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Groups</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {/* <button className="btn"><i className="fa fa-plus"></i> New User</button> */}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.groupReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Groups</CardHeader>
                            <CardBody>
                                <BootstrapTable keyField='id' data={this.showGroups(groups)} columns={columns} />
                            </CardBody>
                        </Card> : null}
                        {this.state.groupWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Group</CardHeader>
                            <CreateGroup groupData={this.state.updateData} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ groups }) {
    return {
        groups
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listGroups,
        deleteGroup

    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
