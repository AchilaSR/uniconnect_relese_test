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

    handleEditRow(row) {
        this.setState({ selected: row })
    }

    render() {
        const { disposition_forms: templates } = this.props;

        if (!templates) {
            return <Loader />
        }

        const columns = [{
            dataField: 'name',
            text: 'Name'
        }, {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 80
            }, hidden: !this.state.hasWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title='Delete'><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Forms</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card style={{ width: 300 }}>
                            <CardHeader>Disposition Forms</CardHeader>
                            <CardBody>
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3 flex-grow-1">
                            <CardHeader>{this.state.selected ? "Edit" : "New"} Form</CardHeader>
                            <Create data={this.state.selected} onCancel={() => this.setState({ selected: null })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ disposition_forms }) {
    return {
        disposition_forms
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
