import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove } from '../action';
import { index as listDispositions } from '../../disposition-forms/action';
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

    render() {
        const { disposition_plans: templates, disposition_forms, queues } = this.props;

        if (!templates || !disposition_forms || !queues) {
            return <Loader />
        }

        const columns = [{
            dataField: 'queue_extension',
            text: 'Queue',
            formatter: (cell) => {
                const queue = _.find(queues, { extension: cell })
                if (parseInt(cell) === 0)
                    return <b>Default</b>
                else if (queue)
                    return `${cell}: ${queue.display_name}`
                else
                    return cell;
            }
        }, {
            dataField: 'form_id',
            text: 'Disposition Form',
            formatter: (cell) => {
                const form = _.find(disposition_forms, { id: cell })
                if (form)
                    return `${cell}: ${form.name}`
                else
                    return cell;
            }
        }, {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 60
            }, hidden: !this.state.hasWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
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
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates.sort((a, b) => (parseInt(a.queue_extension) - parseInt(b.queue_extension)))} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Plan</CardHeader>
                            <Create />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ disposition_plans, disposition_forms, queues }) {
    return {
        disposition_plans,
        disposition_forms,
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
