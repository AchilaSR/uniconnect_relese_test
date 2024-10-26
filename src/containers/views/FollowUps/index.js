import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { loadFollowUps, deleteFollowUps, changeFollowupOwnership } from '../../../actions/facilities';
import { CSVLink } from 'react-csv';
import { listUsers } from '../../../actions/users';
import Select from 'react-select';
import { formatDateTime } from '../../../config/util';
import { checkPermission } from '../../../config/util';

class Dial extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recovery_officer: "",
            contract_number: "",
            costomer_id: "",
            selected: [],
            newRecoveryOfficer: "",
            user: "",
            writePermission: false
        }
    }

    handleEditRow(row) {
        this.props.history.push({
            pathname: "/leads/dial",
            search: `?search=${row.costomer_id}&searchBy=Lead%20ID&clickedReminder=true`
        })
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this follow up?")) {
            this.props.deleteFollowUps(row.costomer_id);
        }
    }

    componentWillMount() {
        this.props.loadFollowUps();
        this.props.listUsers();
        this.setState({ writePermission: checkPermission('Followups Management', 'WRITE') });
    }

    getReportData(input) {
        if (input.length === 0) {
            return { data: null, headers: null };
        }
        const headers = [
            { label: 'Contract #', key: 'contract_number' },
            { label: 'Customer #', key: 'costomer_id' },
            { label: 'Followup Note', key: 'followup_note' },
            { label: 'Agent', key: 'recovery_officer' },
            { label: 'Due On', key: 'due_on' }
        ];

        return { data: input, headers };
    }

    handleOnSelect = (row, isSelect) => {
        if (isSelect) {
            this.setState(() => ({
                selected: [...this.state.selected, row.costomer_id]
            }));
        } else {
            this.setState(() => ({
                selected: this.state.selected.filter(x => x !== row.costomer_id)
            }));
        }
    }

    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r.costomer_id);
        if (isSelect) {
            this.setState(() => ({
                selected: ids
            }));
        } else {
            this.setState(() => ({
                selected: []
            }));
        }
    }

    changeFollowupOwnership() {
        if (!this.state.user || this.state.selected.length === 0) {
            alert("Please select all the mandatory feilds");
            return;
        }

        this.props.changeFollowupOwnership({
            "user_id": this.state.user.login_id,
            "customer_ids": this.state.selected
        }, (err) => {
            if (!err) {
                this.setState({ selected: [], user: "" })
            }
        })
    }

    render() {
        const { followups, users } = this.props;

        if (!followups || !users) {
            return <Loader />;
        }

        const filtered_followups = followups.filter((a) => (
            a.recovery_officer.toLowerCase().indexOf(this.state.recovery_officer.toLowerCase()) > -1 && a.costomer_id.indexOf(this.state.costomer_id) > -1 && a.contract_number.indexOf(this.state.contract_number) > -1
        ))

        const { data, headers } = this.getReportData(followups);

        const columns = [{
            dataField: 'costomer_id',
            text: 'Customer #'
        }, {
            dataField: 'contract_number',
            text: 'Contact Number'
        }, {
            dataField: 'due_on',
            text: 'Due On',
            formatter: (cellContent, row) => (formatDateTime(cellContent))
        }, {
            dataField: 'followup_note',
            text: 'Follow Up Note',
            formatter: (cell) => {
                return cell.split("+++++++").map((a) =>
                    <p className='mb-0'>{a}</p>
                )
            }
        }, {
            dataField: 'recovery_officer',
            text: 'Agent'
        }, {
            dataField: 'costomer_id',
            text: '',
            headerStyle: {
                width: 90
            },
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button size="sm" outline onClick={() => this.handleEditRow(row)} color="primary" title='View'><i className="fa fa-eye" ></i></Button>
                        <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger" title='Delete'><i className="fa fa-trash" ></i></Button>
                    </div>
                );
            }
        }];

        const selectRow = {
            mode: 'checkbox',
            clickToSelect: true,
            selected: this.state.selected,
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll
        };

        // CSV file format before download
        if(data != null ){
            data.map((followup) => { 
                let split_data = followup?.followup_note.split("+++++++");
                followup && (followup.followup_note= `${split_data[0]} ${split_data[1]}`);    
            })
            }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Follow Ups</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {this.props.followups.length ? <CSVLink data={data} headers={headers} filename={"followups.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardBody>
                            <div className="d-flex  justify-content-between">
                                <Form inline>
                                    <FormGroup className="mr-2">
                                        <Label className="mr-3">Search by</Label>
                                        <Input value={this.state.recovery_officer} onChange={(e) => { this.setState({ recovery_officer: e.target.value }) }} style={{ width: 200 }} type="text" placeholder="Agent" />
                                    </FormGroup>
                                    <FormGroup className="mr-2">
                                        <Input value={this.state.costomer_id} onChange={(e) => { this.setState({ costomer_id: e.target.value }) }} style={{ width: 150 }} type="text" placeholder="Customer Number" />
                                    </FormGroup>
                                    <FormGroup className="mr-2">
                                        <Input value={this.state.contract_number} onChange={(e) => { this.setState({ contract_number: e.target.value }) }} style={{ width: 150 }} type="text" placeholder="Contact Number" />
                                    </FormGroup>
                                </Form>
                                {this.state.selected.length > 0 && this.state.writePermission &&
                                    <Form className="text-right" inline>
                                        <FormGroup className="mr-2">
                                            <Label className="mr-3">{`Assign ${this.state.selected.length} facilit${this.state.selected.length === 1 ? "y" : "ies"} to`}</Label>
                                            <div style={{ width: 200 }}>
                                                <Select
                                                    name="form-field-name2"
                                                    value={this.state.user}
                                                    options={users}
                                                    onChange={(e) => this.setState({ user: e })}
                                                    isMulti={false}
                                                    getOptionValue={option => option['login_id']}
                                                    getOptionLabel={option => `${option['first_name']} ${option['last_name']} (${option['login_username']})`}
                                                    styles={{
                                                        menu: (provided, state) => ({
                                                            ...provided,
                                                            zIndex: 20,
                                                            textAlign: "left"
                                                        }),
                                                        dropdownIndicator: () => ({
                                                            padding: 4
                                                        }),
                                                        control: base => ({
                                                            ...base,
                                                            height: 32,
                                                            minHeight: 32
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </FormGroup>
                                        <Button onClick={() => this.changeFollowupOwnership()} color="primary">Assign</Button>
                                    </Form>}
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>Follow Ups</CardHeader>
                        <CardBody>
                            {filtered_followups.length > 0 ?
                                <BootstrapTable selectRow={this.state.writePermission ? selectRow : {
                                    mode: 'radio',
                                    hideSelectColumn: true
                                }} keyField='costomer_id' data={filtered_followups} columns={columns} pagination={paginationFactory({ hideSizePerPage: true })} /> : "No data available"}
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ followups, users }) {
    return {
        followups, users
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadFollowUps,
        listUsers,
        deleteFollowUps,
        changeFollowupOwnership
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);
