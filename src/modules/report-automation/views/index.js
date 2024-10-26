import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import { index, add, remove } from '../action';
import { loadTemplates, deleteTemplate } from '../../../actions/campaigns';
import { checkPermission } from '../../../config/util';
import cronstrue from 'cronstrue';

class Templates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            campaignReadAccess: false,
            campaignWriteAccess: false,
        };
    }

    handleViewRow(row) {
        this.props.history.push("facilities", row);
    }

    deleteTemplate(id) {
        if (window.confirm("Are you sure, you want to delete this campaign?")) {
            this.props.deleteReport(id);
        }
    }

    componentWillMount() {
        // this.props.loadTemplates();
        this.props.scheduleReports();
        this.setState({ campaignReadAccess: checkPermission('Reports', 'READ') });
        this.setState({ campaignWriteAccess: checkPermission('Reports', 'WRITE') });
    }
    render() {
        const { schedule_reports } = this.props;
        if (!schedule_reports) {
            return <Loader />;
        }

        const columns = [
            {
                dataField: 'report_name',
                text: 'Name'
            },
            {
                dataField: 'schedule',
                text: 'Schedule',
                formatter: (cell) => {
                    return cronstrue.toString(cell, { verbose: true });
                }
            },
            {
                dataField: 'range',
                text: 'Range',
                formatter: (cell, row) => {
                    let text = cell === -1 ? "Previous" : "Current";
                    const params = row.schedule.split(" ");
                    if (params[2] === "*" && params[3] === "*" && params[4] === "*") {
                        return text + " day";
                    }

                    if (params[3] === "*" && params[4] === "*") {
                        return text + " month";
                    }

                    return text + " week";
                }
            },
            {
                dataField: 'report_type',
                text: 'Report Type',
                formatter: (cell) => {
                    return _.startCase(cell.replace("DialerCore/", "").replace("get", "").replace(".htm", ""))
                }
            },
            {
                dataField: 'emails',
                text: 'Emails'
            }, {
                dataField: 'id',
                text: '',
                headerStyle: {
                    width: 40
                }, hidden: !this.state.campaignWriteAccess,
                formatter: (cellContent, row) => {
                    return (
                        <div className="d-flex justify-content-around">
                            <Button size="sm" outline onClick={() => this.deleteTemplate(cellContent)} color="danger"><i className="fa fa-trash" ></i></Button>
                        </div>
                    );

                }
            }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Scheduled Reports</li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardHeader>
                            Report
                        </CardHeader>
                        <CardBody>
                            {schedule_reports.length > 0 ? <BootstrapTable keyField='id' data={schedule_reports} columns={columns} /> : "No data available"}
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ templates, schedule_reports }) {
    return {
        templates, schedule_reports
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadTemplates, deleteTemplate,
        deleteReport: remove,
        scheduleReports: index
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Templates);
