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
        const { email_templates } = this.props;

        if (!email_templates) {
            return <Loader />
        }

        const columns = [{
            dataField: 'subject',
            text: 'Subject',
            headerStyle: {
                width: 200
            },
        }, {
            dataField: 'body',
            text: 'Body'
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
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title={"Delete"}><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Email Templates</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Email Templates</CardHeader>
                            <CardBody>
                                {email_templates && email_templates.length > 0 ? <BootstrapTable keyField='id' data={email_templates} columns={columns} /> : "No Records Found"}
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

function mapStateToProps({ email_templates }) {
    return {
        email_templates
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
