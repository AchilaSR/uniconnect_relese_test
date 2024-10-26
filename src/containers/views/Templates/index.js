import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';

import { loadTemplates, deleteTemplate } from '../../../actions/campaigns';
import { checkPermission } from '../../../config/util';

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

    deleteTemplate(name) {
        if (window.confirm("Are you sure, you want to delete this campaign?")) {
            this.props.deleteTemplate(name);
        }
    }

    componentWillMount() {
        this.props.loadTemplates();
        this.setState({ campaignReadAccess: checkPermission('Campaigns Management', 'READ') });
        this.setState({ campaignWriteAccess: checkPermission('Campaigns Management', 'WRITE') });
    }
    render() {
        const { templates } = this.props;

        if (!templates) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'name',
            text: 'Template Name'
        }, {
            dataField: 'name',
            text: '',
            headerStyle: {
                width: 40
            }, hidden: !this.state.campaignWriteAccess,
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.deleteTemplate(cellContent)} color="danger" title={"Delete"}><i className="fa fa-trash" ></i></Button>
                    </div>
                );

            }
        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Templates</li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardHeader>
                            Templates
                        </CardHeader>
                        <CardBody>
                            {templates.length > 0 ? <BootstrapTable keyField='name' data={templates.map(t => { return { name: t } })} columns={columns} /> : "No data available"}
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ templates }) {
    return {
        templates
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadTemplates, deleteTemplate
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Templates);
