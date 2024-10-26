import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index, remove } from '../action';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { checkPermission } from '../../../config/util'
import Loader from '../../../components/Loader';
import Search from './search';
import { LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';

class Dnc extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false,
            search: ""
        };
    }

    componentWillMount() {
        this.props.listDnc();
        this.setState({ hasReadAccess: checkPermission('DNC Management', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('DNC Management', 'WRITE') });
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this number?")) {
            this.props.removeDnc(row.id);
        }
    }

    render() {
        const { dnc } = this.props;

        if (!dnc) {
            return <Loader />
        }

        const filtered = dnc.filter((a) => (
            a.msisdn && a.msisdn.indexOf(this.state.search.slice(-LOCAL_PHONE_NUMBER_LENTGH)) > -1
        ));

        const columns = [{
            dataField: 'id',
            text: 'ID',
            headerStyle: {
                width: 100
            },
            classes: "text-uppercase"
        }, {
            dataField: 'msisdn',
            text: 'MSISDN'
        }, {
            dataField: 'configuredon',
            text: 'Added Date',
            headerStyle: {
                width: 150
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
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title={"Delete"}><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">DNC Management</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="mr-3" style={{ width: 400 }}>
                            <Card className='mb-3'>
                                <CardHeader>Search Numbers</CardHeader>
                                <Search value={this.state.search} onSearch={(e) => this.setState({ search: e })} />
                            </Card>
                            {this.state.hasWriteAccess ? <Card className='mb-3'>
                                <CardHeader>Add Numbers</CardHeader>
                                <Create />
                            </Card> : null}
                        </div>
                        <Card className="flex-grow-1">
                            <CardHeader>DNC Management</CardHeader>
                            <CardBody>
                                {filtered && filtered.length > 0 ? <BootstrapTable pagination={paginationFactory({ hideSizePerPage: true })} keyField='id' data={filtered} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ dnc }) {
    return {
        dnc
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listDnc: index,
        removeDnc: remove
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Dnc));
