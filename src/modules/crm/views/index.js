import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import Loader from '../../../components/Loader';
import { checkPermission, getReportData } from '../../../config/util';
import { CSVLink } from 'react-csv';
import { getFieldView, getAllRecords, getModuleDescription, deleteRecord, getAllRecordsByPage, searchRecords, setSortOrder } from '../action';
import Create from './create';
import FilterReport from './filter';
import Table from './table';
import { DEFAULT_PAGE_SIZE } from '../../../config/globals';
import { ACCESS_LEVELS, CRM_PERMISSIONS, MODULES } from '../config';
import { CUSTOM } from '../../../custom';
import Modal from '../../../components/Modal';

let MODULE = "";

class Dial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showLegend: false,
            filtered_facilities: [],
            selected: null,
            createNew: false,
            page: 0,
            pageSize: DEFAULT_PAGE_SIZE,
            deletable: false,
            editable: false,
            creatable: false,
            largeSidePanel: false,
            sortOrder: "desc",
            sortField: "id",
        }
    }

    handleEditRow(row) {
        this.setState({ selected: row, mode: "edit" });
    }

    handleViewRow(row, showPreview) {
        if (showPreview) {
            this.setState({ selected: row, mode: "view" });
            return;
        }

        if (MODULE === "Contacts") {
            this.props.history.push(`/contacts/${row.id}`, row);
        } else if (MODULE === "Accounts") {
            this.props.history.push(`/account/${row.id}`, row);
        } else {
            this.setState({ selected: row, mode: "view" });
        }
    }

    handleDeleteRow(row) {
        if (window.confirm("Are you sure, you want to delete this record?")) {
            this.props.deleteRecord(MODULE, row.id);
        }
    }

    componentWillMount() {
        this.props.searchRecords("Users", [{ field: "user_name", value: this.props.user.login_username }], (err, data) => {
            if (!err && data.length) {
                this.setState({ user_id: data[0].id });
                this.init(true);
            }
        })
        this.init();
    }

    componentDidUpdate(prevProps) {
        this.init();
    }

    componentWillUnmount() {
        MODULE = "";
    }


    init(force) {
        if (MODULE !== this.props.match.params.module || force) {
            this.setState({ selected: null, mode: null, createNew: false, filters: undefined, largeSidePanel: false });
            MODULE = this.props.match.params.module;
            this.props.getModuleDescription(MODULE);
            this.props.getFieldView(MODULE);

            const perm = CRM_PERMISSIONS[MODULE];

            if (CUSTOM.CRM_FILTERS && CUSTOM.CRM_FILTERS[MODULE]) {
                const filters = CUSTOM.CRM_FILTERS[MODULE];
                this.setState({
                    filters: filters.map((a) => {
                        if (a.indexOf('$userid')) {
                            if (this.state.user_id) {
                                return a.replace('$userid', this.state.user_id)
                            }
                            return a.replace('$userid', "19x999999")
                        }
                        return a;
                    }).filter((a) => (a))
                }, () => {
                    this.onPageChange(0, DEFAULT_PAGE_SIZE);
                });
            } else {
                this.onPageChange(0, DEFAULT_PAGE_SIZE);
            }
            this.setState({
                readable: checkPermission(perm, ACCESS_LEVELS.VIEW),
                deletable: checkPermission(perm, ACCESS_LEVELS.DELETE),
                editable: checkPermission(perm, ACCESS_LEVELS.EDIT),
                creatable: checkPermission(perm, ACCESS_LEVELS.CREATE),
            })

        }
    }

    onPageChange(page, pageSize, sortField, sortOrder) {
        if (!sortField) {
            sortField = this.state.sortField;
        }

        if (!sortOrder) {
            sortOrder = this.state.sortOrder;
        }

        this.setState({ page, pageSize, sortField, sortOrder }, () => {
            if (!this.state.filters || !this.state.filters.length) {
                this.props.getAllRecordsByPage(MODULE, this.state.page, this.state.pageSize, (totalSize) => {
                    if (totalSize) {
                        this.setState({ totalSize });
                        // } else {
                        //     this.setState({ totalSize: (this.state.page * this.state.pageSize) + 1 });
                    }
                }, this.state.sortField, this.state.sortOrder);
            } else {
                this.props.searchRecords(MODULE, this.state.filters.join(" AND "), (err, data = [], totalSize) => {
                    this.setState({ totalSize });
                }, false, `ORDER BY ${this.state.sortField} ${this.state.sortOrder}`, this.state.page, this.state.pageSize);
            }
        })
    }

    onFilterChange(filters) {
        this.setState({ filters }, () => {
            this.onPageChange(0, DEFAULT_PAGE_SIZE)
        });
    }

    onFormCancel(row) {
        if (this.state.mode === "view" || !row) {
            this.setState({ selected: null, createNew: false })
        } else {
            this.onPageChange(0, DEFAULT_PAGE_SIZE)
            this.handleViewRow(row, true)
        }
    }

    render() {
        const { crm_records, field_list, module_description } = this.props;
        if (!field_list || !module_description) {
            return <Loader />;
        }

        const { data, headers } = getReportData(crm_records);
        const { sort_fields } = this.props;

        return (
            <div className="animated fadeIn">

                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">{(CUSTOM.CRM_MODULES || MODULES)[MODULE]}</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            {/* {this.props.crm_records && this.props.crm_records.length ? <CSVLink data={data} headers={headers} filename={`${MODULE}.csv`} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink> : ""} */}
                            {this.state.creatable ? <a className="btn" onClick={() => this.setState({ selected: null, createNew: true, mode: "create" })} ><i className="fa fa-plus"></i> Create</a> : ""}
                            {MODULE === "Contacts" ? <Link className="btn" to="/contacts" ><i className="fa fa-search"></i> Search</Link> : ""}
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between table-panel">
                        <div className="mr-3" style={{ width: 360, minWidth: 360, display: (!this.state.selected && !this.state.createNew) && this.state.readable ? 'block' : 'none' }}>
                            <Card>
                                <CardHeader>Filter Data</CardHeader>
                                <CardBody>
                                    <FilterReport onFilterChange={(data) => this.onFilterChange(data)} module={MODULE} />
                                </CardBody>
                            </Card>
                        </div>
                        {this.state.largeSidePanel ? "" : <div className={"flex-grow-1"} >
                            <Card>
                                <CardHeader>
                                    {(CUSTOM.CRM_MODULES || MODULES)[MODULE]}
                                    <div className='float-right '>
                                        {this.state.readable && this.state.filters && this.state.filters.length ? <span className='px-2'><a className="btn m-0 p-0 px-2" onClick={() => this.onFilterChange()} color="link">Clear Filters</a>|</span> : ""}
                                        <a className="btn m-0 p-0" onClick={() => this.setState({ showLegend: !this.state.showLegend })} color="link">{this.state.showLegend ? "Hide Column List" : "Choose Columns"}</a>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <Table
                                        onEditRow={(e) => this.handleEditRow(e)}
                                        onDeleteRow={(e) => this.handleDeleteRow(e)}
                                        onViewRow={(e) => this.handleViewRow(e)}
                                        module={MODULE}
                                        page={this.state.page}
                                        sortField={this.state.sortField}
                                        sortOrder={this.state.sortOrder}
                                        pageSize={this.state.pageSize}
                                        totalSize={this.state.totalSize}
                                        hideDescription={true}
                                        showLegend={this.state.showLegend}
                                        editable={this.state.editable}
                                        deletable={this.state.deletable}
                                        user={this.props.user}
                                        onPageChange={(page, pageSize, sortField, sortOrder) => this.onPageChange(page, pageSize, sortField, sortOrder)}
                                    />
                                </CardBody>
                            </Card>
                        </div>}
                        {this.state.selected || this.state.createNew ?
                            <div className={this.state.largeSidePanel ? "flex-grow-1" : "ml-3"} style={this.state.largeSidePanel ? {} : { width: 350, minWidth: 350 }}>
                                <Card>
                                    <CardHeader className='d-flex justify-content-between'>
                                        <div>{this.state.mode === "view" ? "View" : this.state.selected ? "Edit" : "New"} Record</div>
                                        <div><Button color='outline-primary' onClick={() => this.setState({ largeSidePanel: !this.state.largeSidePanel })} size='xs'>{this.state.largeSidePanel ? <i className='fa fa-compress'></i> : <i className='fa fa-expand'></i>}</Button></div>
                                    </CardHeader>
                                    <CardBody>
                                        <Create
                                            columns={this.state.largeSidePanel ? 3 : 1}
                                            onViewRow={() => this.handleViewRow(this.state.selected)}
                                            onEditRow={() => this.handleEditRow(this.state.selected)}
                                            onCancel={(row) => { this.onFormCancel(row); this.setState({ largeSidePanel: false }) }}
                                            module={MODULE}
                                            editable={this.state.editable}
                                            deletable={this.state.deletable}
                                            data={this.state.selected}
                                            filters={this.state.filters}
                                            onConvertLead={() => this.setState({ convertLead: true })}
                                            mode={this.state.mode} />
                                    </CardBody>
                                </Card>
                            </div> : ""}
                    </div>
                </div>
                <Modal size="lg" title={"Convert Lead"} toggle={() => { this.setState({ convertLead: !this.state.convertLead }) }} isOpen={this.state.convertLead}>
                    {!this.state.contact ? <>
                        <h5>Create Contact <i className='fa fa-caret-right text-secondary'></i> <span className='text-muted'>Create Opportunity</span></h5>
                        <hr />
                        <Create columns={3} onCancel={(a) => { a ? this.setState({ contact: a }) : this.setState({ convertLead: false }) }} module={"Contacts"} data={{ ...this.state.selected, id: undefined }} mode={"create"} />
                    </> :
                        <>
                            <h5><span className='text-muted'>Create Contact</span> <i className='fa fa-caret-right text-secondary'></i> Create Opportunity</h5>
                            <hr />
                            <Create columns={3} onCancel={(a) => { a ? this.props.history.push(`/contacts/${this.state.contact.id}`, this.state.contact) : this.setState({ convertLead: false }) }} module={"Potentials"} data={{ ...this.state.selected, id: undefined }} profile={this.state.contact.id} mode={"create"} />
                        </>}
                </Modal>
            </div>
        );
    }
}

function mapStateToProps({ crm_records_page, crm_records, field_list, module_description, user }) {
    return {
        field_list: field_list[MODULE],
        crm_records: crm_records_page[MODULE],
        all_users: crm_records["Users"],
        module_description: module_description[MODULE],
        user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFieldView,
        getAllRecords,
        getAllRecordsByPage,
        getModuleDescription,
        deleteRecord,
        searchRecords
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);