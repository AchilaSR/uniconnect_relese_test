import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove } from '../action';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';

class FieldLayout extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false
        };
    }

    componentWillMount() {
        this.props.listFields();
        this.setState({ hasReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this feild?")) {
            this.props.removeField(row.id);
        }
    }

    handleEditRow(row) {
        this.setState({ data: row })
    }

    render() {
        const { field_layout } = this.props;

        if (!field_layout) {
            return <Loader />
        }

        const columns = [{
            dataField: 'field_label',
            text: 'Label'
        }, {
            dataField: 'field_default_value',
            text: 'Default Value',
            headerStyle: {
                width: 100
            },
        }, {
            dataField: 'field_visibility',
            text: 'Visible',
            headerStyle: {
                width: 100
            },
            formatter: (cellContent) => cellContent ? "Yes" : "No"
        }, {
            dataField: 'show_in_list_view',
            text: 'Show in List',
            headerStyle: {
                width: 100
            },
            formatter: (cellContent) => cellContent ? "Yes" : "No"
        }, {
            dataField: 'is_mandatory',
            text: 'Mandatory',
            headerStyle: {
                width: 100
            },
            formatter: (cellContent) => cellContent ? "Yes" : "No"
        },
        {
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
                    <li className="breadcrumb-item active">Field Layout</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Field Layout</CardHeader>
                            <CardBody>
                                {field_layout && field_layout.length > 0 ? <BootstrapTable keyField='id' data={field_layout} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 300 }}>
                            <CardHeader>{this.state.data ? "Edit" : "New"} Field</CardHeader>
                            <Create data={this.state.data} onCancel={() => this.setState({ data: null })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ field_layout }) {
    return {
        field_layout
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listFields: index,
        removeField: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(FieldLayout));
