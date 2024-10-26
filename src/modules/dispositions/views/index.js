import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove, getDispositionTypes, getDispositionCategories } from '../action';
import { index as getClasses } from '../../disposition-classes/action';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';
import _ from "lodash";
import { CATEGORY_COLORS } from '../config';

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
        this.props.getClasses();
        this.props.getDispositionTypes();
        this.props.getDispositionCategories();
        this.setState({ hasReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this template?")) {
            this.props.removeTemplate(row.id);
        }
    }

    render() {
        const { dispositions: templates, disposition_categories } = this.props;

        if (!templates || !disposition_categories) {
            return <Loader />
        }

        const columns = [{
            dataField: 'code',
            text: 'Code',
            headerStyle: {
                width: 100
            },
            classes: "text-uppercase"
        }, {
            dataField: 'disposition',
            text: 'Disposition'
        }, {
            dataField: 'disposition_class',
            text: 'Class'
        }, {
            dataField: 'type',
            text: 'Type',
            classes: "text-capitalize"
        }, {
            dataField: 'category',
            text: 'Category',
            classes: (cellContent) => (`text-center col-status bg-${CATEGORY_COLORS[parseInt(cellContent)]}`),
            formatter: (cellContent, row) => {
                const dc = _.find(disposition_categories, { id: cellContent });
                return dc ? dc.name : "";
            }
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
                    <li className="breadcrumb-item active">Dispositions</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Dispositions</CardHeader>
                            <CardBody>
                                {templates && templates.length > 0 ? <BootstrapTable keyField='id' data={templates} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Disposition</CardHeader>
                            <Create />
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ dispositions, disposition_categories }) {
    return {
        dispositions,
        disposition_categories
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        getClasses,
        getDispositionTypes,
        getDispositionCategories,
        removeTemplate: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
