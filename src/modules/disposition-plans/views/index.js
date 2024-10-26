import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove } from '../action';
import { index as listDispositions } from '../../dispositions/action';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';
import { listQueues } from '../../../actions/configurations';


class Groups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false
        };
    }

    componentWillMount() {
        this.props.listTemplates();
        this.props.listDispositions();
        this.props.listQueues();
        this.setState({ hasReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this template?")) {
            this.props.removeTemplate(row.id);
        }
    }
    handleEditRow(row) {
        this.setState({
          editData: {
            rowId: row.id,
            plan_name: row.plan,
            queue: { extension: row.queue_extension },
            dispositions: row.dispositions.map(disposition => ({ id: disposition.id, disposition: disposition.disposition }))
          }
        }, () => {
          console.log("Edit Data:", this.state.editData);
        });
      }

    render() {
        const { disposition_plans: templates, dispositions, queues } = this.props;

        if (!templates || !dispositions|| !queues) {
            return <Loader />
        }

        const columns = [{
            dataField: 'plan',
            text: 'Plan'
        },{
            dataField: 'queue_extension',
            text: 'Queue'
        },{
            dataField: 'dispositions',
            text: 'Dispositions',headerStyle: {
                width: 400
            },
            formatter: (cellContent, row) => {
                return (
                    cellContent.map((a) => a.disposition).join(", ")
                );
            }
        }, {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 80
            }, hidden: !this.state.hasWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title={"Edit"}><i className="fa fa-pencil" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title={"Delete"}><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Plans</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Disposition Plans</CardHeader>
                            <CardBody>
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Plan</CardHeader>
                            <Create editData={this.state.editData} queues={this.props.queues} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ disposition_plans, dispositions, queues, }) {
    return {
        disposition_plans,
        dispositions,
        queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove,
        listDispositions,
        listQueues
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
