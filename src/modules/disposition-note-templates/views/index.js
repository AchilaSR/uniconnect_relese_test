import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove } from '../action';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';

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
        this.setState({ hasReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this template?")) {
            this.props.removeTemplate(row.id);
        }
    }

    render() {
        const { disposition_templates: templates } = this.props;

        if (!templates) {
            return <Loader />
        }

        const columns = [{
            dataField: 'note_data',
            text: 'Note Type',
            headerStyle: {
                width: 200
            },
        }, {
            dataField: 'note_description',
            text: 'Note Value'
        },
        {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 60
            }, hidden: !this.state.hasWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Note Templates</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Disposition Note Templates</CardHeader>
                            <CardBody>
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Template</CardHeader>
                            <Create />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ disposition_templates }) {
    return {
        disposition_templates
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
