import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove, getCliList } from '../action';
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
        this.props.listCli();
        this.setState({ hasReadAccess: checkPermission('Configurations', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Configurations', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this CLI?")) {
            this.props.removeTemplate(row.id);
        }
    }

    handleEditRow(row) {
        this.setState({ data: row })
    }

    render() {
        const { outbound_cli} = this.props;



        if (!outbound_cli) {
            return <Loader />
        }

        const columns = [{
            dataField: 'cli',
            text: 'CLI Name',
            headerStyle: {
                width: 200
            },
        }, {
            dataField: 'prefix',
            text: 'Prefix',
            headerStyle: {
                width: 150
            },
        },
        {
            dataField: 'cli_list',
            text: 'CLI List',
            formatter: (cell) => cell ? cell.join(', ') : '',
            headerStyle: {
                width: 200
            },
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
                        {/* <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary"><i className="fa fa-pencil" ></i></Button> */}
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title={"Delete"} ><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Oubound CLI</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.state.hasReadAccess ? <Card className="flex-grow-1">
                            <CardHeader>Oubound CLI</CardHeader>
                            <CardBody>
                                {outbound_cli && outbound_cli.length > 0 ? <BootstrapTable keyField='id' data={outbound_cli} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card> : null}
                        {this.state.hasWriteAccess ? <Card className="ml-3" style={{ width: 400 }}>
                            <CardHeader>{this.state.data ? "Edit" : "New"} Oubound CLI</CardHeader>
                            <Create data={this.state.data} onCancel={() => this.setState({ data: null })}/>
                        </Card> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ outbound_cli,}) {
    return {
        outbound_cli
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listCli: index,
        removeTemplate: remove,
        getCliList
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));
