import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Badge } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateReport from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { checkPermission } from '../../../../config/util'
import { loadReports, deleteReport } from '../../../../actions/reports.js';

import Loader from '../../../../components/Loader';

class DialerReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            readAccess: false,
            writeAccess: false
        };
    }

    componentWillMount() {
        this.props.loadReports();
        this.setState({ readAccess: checkPermission('Reports', 'READ') });
        this.setState({ writeAccess: checkPermission('Reports', 'WRITE') });
    }

    download(row) {
        window.open(row.download_link + "?access_token=" + this.props.user.access_token)
    }

    handleDeleteRow(row) {
        if (window.confirm('Are you sure you want to delete this report?')) {
            this.props.deleteReport(row.report_id);
        }
    }

    render() {
        const { reports } = this.props;

        if (!reports) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'report_name',
            text: 'Name'
        }, {
            dataField: 'status',
            text: 'Status',
            headerStyle: {
                width: 90
            },
            formatter: (cellContent, row) => {
                return (
                    <div className="text-center">
                        <Badge color={cellContent === "READY" ? "success" : cellContent === "FAILED" ? "danger" : "warning"} >
                            {cellContent}
                        </Badge>
                    </div>
                );
            }
        },
        {
            dataField: 'report_id',
            text: '',
            headerStyle: {
                width: 90
            },
            formatter: (cellContent, row) => {
                if (row.status === "READY") {
                    return (
                        <div className="d-flex justify-content-around">
                            <Button size="sm" outline onClick={() => this.download(row)} color="primary"><i className="fa fa-download" ></i></Button>
                            {this.state.writeAccess && <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button>}
                        </div>
                    );
                } else {
                    return (
                        <div className="d-flex justify-content-around">
                            {this.state.writeAccess && <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button>}
                        </div>
                    );
                }

            }
        }];
        return (
           
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Dialer Report</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {/* <button className="btn"><i className="fa fa-plus"></i> New User</button> */}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {
                            this.state.writeAccess &&
                            <Card className="mr-3" style={{ width: 300 }}>
                                <CardHeader>Report Settings</CardHeader>
                                <CreateReport />
                            </Card>
                        }
                        {
                            this.state.readAccess &&
                            <Card className="flex-grow-1">
                                <CardHeader>Reports</CardHeader>
                                <CardBody>
                                    <BootstrapTable keyField='report_id' data={reports} columns={columns} />
                                </CardBody>
                            </Card>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ reports, user }) {
    return {
        reports, user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadReports, deleteReport
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(DialerReport));
