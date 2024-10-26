import React, { Component } from 'react';
import { Card, CardHeader, Button } from 'reactstrap';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { remove } from '../action';
import { checkPermission } from '../../../config/util'
import { CUSTOM } from '../../../custom';
import { MODULES } from '../../crm/config';

class Groups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false
        };
    }

    componentWillMount() {
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
        const templates = Object.keys(CUSTOM.CRM_MODULES || MODULES).map((a) => ({ module: a, id: module }))

        const columns = [{
            dataField: 'module',
            text: 'Name'
        }, {
            dataField: 'id',
            text: '',
            headerStyle: {
                width: 60
            },
            hidden: !this.state.hasWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
                        {/* <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button> */}
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">CRM Forms</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasWriteAccess ? <Card className="ml-3 flex-grow-1">
                            <CardHeader>Configure Dependencies</CardHeader>
                            <Create data={this.state.selected} onCancel={() => this.setState({ selected: null })} />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ crm_forms }) {
    return {
        crm_forms
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        removeTemplate: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
