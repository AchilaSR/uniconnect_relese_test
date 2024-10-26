import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateUser from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { listUsers, deleteUser, unclockUser } from '../../../actions/users';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';
import { listRoles } from '../../../actions/roles';
import { listGroups } from '../../../actions/groups';
import Filter from './filter';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            userReadAccess: false,
            userWriteAccess: false
        }
    }

    componentWillMount() {
        this.props.listUsers();
        this.props.listRoles();
        this.props.listGroups();
        this.setState({ userReadAccess: checkPermission('User Management', 'READ') });
        this.setState({ userWriteAccess: checkPermission('User Management', 'WRITE') });

    }

    handleEditRow(row) {
        this.setState({ user: row })
    }
    handleDeleteRow(row) {
        if (window.confirm("Are you sure you want to delete the user?")) {
            this.props.deleteUser(row.login_id);
        }
    }

    handleUnlockRow(row) {
        if (window.confirm("Are you sure you want to unlock the user?")) {
            this.props.unclockUser(row.login_username);
        }
    }

    render() {
        const { users } = this.props;

        if (!users) {
            return <Loader />
        }

        let filtered_users = users.filter((a) => {
            if (this.state.filter) {
                if (this.state.filter.name && (a.first_name || "").toLowerCase().indexOf(this.state.filter.name.toLowerCase()) === -1 && (a.last_name || "").toLowerCase().indexOf(this.state.filter.name.toLowerCase()) === -1) {
                    return false;
                }

                if (this.state.filter.username && a.login_username.toLowerCase().indexOf(this.state.filter.username.toLowerCase()) === -1) {
                    return false;
                }

                if (this.state.filter.role && a.login_role_name !== this.state.filter.role.name) {
                    return false;
                }
            }
            return true;
        });



        const columns = [{
            dataField: 'first_name',
            text: 'Name',
            formatter: (cellContent, row) => {
                return row.first_name ? row.first_name : "" + ' ' + row.last_name ? row.last_name : "";
            }
        }, {
            dataField: 'login_username',
            text: 'Username',
            formatter: (cellContent, row) => {
                const text = row.account_locked ? row.login_username + " - " + row.locked_reason : row.login_username;
                const color = row.account_locked ? 'red' : 'initial';
                return <span style={{ color }}>{text}</span>;
            }
        }, {
            dataField: 'login_role_name',
            text: 'Role'
        }, {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 120
            }, hidden: !this.state.userWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title="Edit" >  <i className="fa fa-pencil" ></i></Button>
                        <Button disabled={!row.account_locked} size="sm" outline onClick={() => this.handleUnlockRow(row)} color="primary" title={row.account_locked ? "Unlock" : "Lock"}> {row.account_locked ? <i className="fa fa-unlock"></i> : <i className="fa fa-lock"></i>}
                        </Button>
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title="Delete"><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Users</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.userReadAccess ? <div className="mr-3" style={{ width: 300 }}><Card>
                            <CardHeader>Filter</CardHeader>
                            <CardBody>
                                <Filter onSearch={(filter) => this.setState({ filter })} />
                            </CardBody>
                        </Card></div> : null}
                        {this.state.userReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Users</CardHeader>
                            <CardBody>
                                {filtered_users ?
                                    <BootstrapTable pagination={paginationFactory({ hideSizePerPage: true })} keyField='login_id' data={filtered_users} columns={columns} /> : ""}
                            </CardBody>
                        </Card> : null}
                        {this.state.userWriteAccess && this.state.user ? <div className="ml-3" style={{ width: 300 }}><Card>
                            <CardHeader>Edit User</CardHeader>
                            <CreateUser user={this.state.user} onClose={() => this.setState({ user: null })} />
                        </Card></div> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ users }) {
    return {
        users
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listUsers,
        deleteUser,
        listRoles,
        listGroups,
        unclockUser
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Users));
