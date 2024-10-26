import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove, create } from '../action';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';
import { listIVRs, listQueues, list3cxGroups } from '../../../actions/configurations';

class DashboardTemplates extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false
        };
    }

    componentWillMount() {
        this.props.listTemplates();
        this.setState({ hasReadAccess: checkPermission('Dashboard', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Dashboard', 'WRITE') });
        this.props.listQueues();
        this.props.listIVRs();
        this.props.list3cxGroups();
    }


    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this template?")) {
            this.props.removeTemplate(row.id);
        }
    }

    handleViewRow(row) {
        this.props.history.push({
            pathname: `/dashboard/${row.id}`,
            state: row
        })
    }


    handleUpdateRow(row) {
        row.is_public = !row.is_public;
        const btn = document.getElementById(`edit_${row.id}`);
        btn.disabled = true;
        this.props.updateDashboard(row, () => {
            // this.props.listTemplates();
            btn.disabled = false;
        });
    }

    render() {
        const { dashboards: templates, user } = this.props;

        if (!templates) {
            return <Loader />
        }

        const columns = [{
            dataField: "name",
            text: 'Dashboard Name',
        },
        {
            dataField: "id",
            text: '',
            headerStyle: {
                width: 90
            }, hidden: !this.state.hasReadAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleViewRow(row)} color="primary" title='View'><i className="fa fa-eye" ></i></Button>
                        {/* <Button id={`edit_${row.id}`} title='Make dashboard public' disabled={row.created_by !== user.user_details.extension} size="sm" outline onClick={() => this.handleUpdateRow(row)} color="primary"><i className={`fa ${row.is_public ? 'fa-unlock' : 'fa-lock'}`} ></i></Button> */}
                        
                        {this.state.hasWriteAccess &&  <Button disabled={row.created_by !== user.user_details.extension} size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button>}
                       
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Dashboard Templates</li>
                    {this.state.hasWriteAccess ?
                        <li className="breadcrumb-menu">
                            <div className="btn-group">
                                <a className="btn" onClick={() => this.props.history.push({ pathname: "/new-dashboard" })}><i className="fa fa-plus"></i> New Dashboard</a>
                            </div>
                        </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="flex-grow-1">
                            <CardHeader>Dashboard Templates</CardHeader>
                            <CardBody>
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ dashboards, user }) {
    return {
        dashboards,
        user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove,
        updateDashboard: create,
        listQueues,
        listIVRs,
        list3cxGroups
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(DashboardTemplates));
