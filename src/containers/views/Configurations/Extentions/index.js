import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import CreateExtention from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { listExtensions, deleteExtention } from '../../../../actions/configurations';
import { checkPermission } from '../../../../config/util';

class Configurations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            extention_name: "",
            extention_id: "",
            extentionReadAccess: false,
            extentionWriteAccess: false
        };
    }

    componentWillMount() {
        this.props.listExtentions();
        this.setState({ extentionReadAccess: checkPermission('User Management', 'READ') });
        this.setState({ extentionWriteAccess: checkPermission('User Management', 'WRITE') });
    }
    handleDeleteRow(row) {
        this.props.deleteExtention(row.id);
    }

    render() {
        const { configurations } = this.props;

        const columns = [{
            dataField: 'extension',
            text: 'Extension'
        },
            // {
            //     dataField: 'id',
            //     text: '',
            //     headerStyle: {
            //         width: 120
            //     }, hidden: !this.state.extentionWriteAccess,
            //     formatter: (cellContent, row) => {
            //         return (
            //             <div className="d-flex justify-content-around">
            //                 <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" ></i></Button>
            //             </div>
            //         );
            //     }
            // }
        ];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Extensions</li>
                    {/* <li className="breadcrumb-menu">
                        <div className="btn-group">
                        </div>
                    </li> */}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.extentionReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Extensions</CardHeader>
                            <CardBody>
                                <BootstrapTable keyField='id' data={configurations ? configurations : []} columns={columns} />
                            </CardBody>
                        </Card> : null}
                        {/* {this.state.extentionWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>New Extension</CardHeader>
                            <CreateExtention />
                        </Card> : null} */}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ configurations }) {
    return {
        configurations
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listExtentions: listExtensions,
        deleteExtention

    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Configurations));
