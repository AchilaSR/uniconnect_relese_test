import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateRole from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { listRoles, deleteRole, setDefaultRole, updateRole } from '../../../actions/roles';
import { checkPermission } from '../../../config/util'
import { loadPermissions } from '../../../actions/permissions';

class Roles extends Component {

    constructor(props) {
        super(props);

        this.state = {
            role_name: "",
            role_description: "",
            isDefault:"",
            role_id: "",
            updateData: {},
            roleReadAccess: false,
            roleWriteAccess: false,
            showForm: false
        };
    }
    componentWillMount() {
        this.props.listRoles();
        this.props.loadPermissions();
        this.setState({ roleReadAccess: checkPermission('User Management', 'READ') });
        this.setState({ roleWriteAccess: checkPermission('User Management', 'WRITE') });
    }

    handleEditRow(row) {
        this.setState({ updateData: row, showForm: true })
    }

    handleEditDefault(row){
        this.setState({})
    }
    handleSetDefault(row) {
        if (window.confirm("Are you sure, you want to this role as default role?")) {
        this.props.setDefaultRole(row.role_id)
        this.props.updateRole({
            description: row.description,
            isDefault:  true,
            role_name : row.name,
            role_id: row.role_id,
            rules: row.rules
        }, (err) => {
            
        })
        }
    }
    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this role?")) {
            this.props.deleteRole(row.role_id);
        }
    }

    render() {
        const { roles } = this.props;

        const columns = [{
            dataField: 'name',
            text: 'Name'
        },
        {
            dataField: 'role_id',
            text: '',
            headerStyle: {
                width: 110
            }, hidden: !this.state.roleWriteAccess,
            formatter: (cellContent, row) => {
                console.log(row.isDefault)
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleSetDefault(row)}    color={row.isDefault == true ? "success" : "primary"} title='Default'><i className={row.isDefault == true ? "fa fa-check-circle":"fa fa-check-circle-o" }></i></Button>
                        {/* <Button size="sm" outline onClick={() => this.handleViewRow(row)} color="primary"><i className="fa fa-eye" ></i></Button> */}
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title="Delete"><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Roles</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <button onClick={() => this.setState({ updateData: {}, showForm: true })} className="btn"><i className="fa fa-plus"></i> New Role</button>
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.roleReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Roles</CardHeader>
                            <CardBody>
                                <BootstrapTable keyField='role_id' data={roles ? roles : []} columns={columns} />
                            </CardBody>
                        </Card> : null}
                        {this.state.roleWriteAccess && this.state.showForm ? <Card className="ml-3" style={{ width: 600 }}>
                            <CardHeader>New Role</CardHeader>
                            <CreateRole roleData={this.state.updateData} clearForm={() => this.setState({ updateData: {}, showForm: false })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ roles }) {
    return {
        roles
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listRoles,
        deleteRole,
        loadPermissions,
        setDefaultRole,
        updateRole
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Roles));
