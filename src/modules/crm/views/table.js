import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../components/Loader';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { MODULES, TICKET_STATUS_COLORS } from '../config';
import correctDate from './components/dateField';
import FieldValue from './components/FieldValue';
import { CUSTOM } from '../../../custom';
import { CRM_FIELDS_ASSET, DEFAULT_PAGE_SIZE } from '../../../config/globals';
import { getFieldView, getModuleDescription, searchRecords, getAllRecordsByPage, setSortOrder } from '../action';
import CommentList from './components/commentList';
import { bindActionCreators } from 'redux';

const defaultSorted = [{
    sortField: 'id',
    sortOrder: 'desc'
}];


class CrmTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filtered_facilities: [],
            selected: null,
            hidden: {},
            all_fields: [],
            initialized: false,
            paged_records: [],
            page: 1,
            columnSortOptions: {},
            sortField: "id",
        }
    }


    handleEditRow(row) {
        this.props.onEditRow(row);
    }

    handleViewRow(row) {
        this.props.onViewRow(row);
    }

    handleDeleteRow(row) {
        this.props.onDeleteRow(row);
    }

    componentWillMount() {
        if (CUSTOM && CUSTOM.CRM_ROW_EXPAND && CUSTOM.CRM_ROW_EXPAND[this.props.module]) {
            this.expandRow = require("../../" + CUSTOM.CRM_ROW_EXPAND[this.props.module]).default;
        } else if (this.props.module === "Contacts" || this.props.module === "HelpDesk" || this.props.module === "Accounts") {
            this.expandRow = {
                onlyOneExpanding: true,
                expandByColumnOnly: true,
                showExpandColumn: true,
                expanded: [this.state.expanded],
                expandColumnPosition: 'left',
                expandHeaderColumnRenderer: ({ isAnyExpands }) => {
                    return "";
                },
                expandColumnRenderer: (row) => {
                    if (row.expandable) {
                        if (row.expanded) {
                            return (
                                <Button color='link' size="xs"><i className="fa fa-minus" ></i></Button>
                            );
                        }
                        return (
                            <Button color='link' size="xs"><i className="fa fa-plus" ></i></Button>
                        );
                    } else {
                        return <Button color='link' disabled size="xs"><i className="fa fa-plus" ></i></Button>
                    }
                },
                renderer: (row) => {
                    return <CommentList editable={this.props.editable} deletable={this.props.deletable} module={this.props.module} id={row.id} />
                }
            };
        }
    }

    componentDidMount() {
        if (!this.props.module_description) {
            this.props.getModuleDescription(this.props.module);
            this.props.getFieldView(this.props.module);
        }

        if (this.props.field_list) {
            this.setFields();
        }

        if (this.props.crm_records) {
            this.setPage();
        }
    }

    setFields() {
        const hidden = {};
        const all_fields = this.props.field_list.reduce((acc, current) => acc.concat(current.fields.map((a, i) => {
            hidden[a.name] = current.category_name !== "default" || i > 6;
            return { name: a.name, label: a.label };
        })), []);

        this.setState({ hidden, all_fields });
    }

    setPage() {
        const { crm_records, pageSize = DEFAULT_PAGE_SIZE, totalSize, sortOrder, onPageChange } = this.props;

        if (typeof onPageChange !== "function") {
            this.setState({ paged_records: crm_records });
            return;
        }

        if (crm_records) {
            if (crm_records.length > pageSize) {
                const { page = 1 } = this.state;

                if (sortOrder === "asc") {
                    this.setState({ paged_records: crm_records.sort((a, b) => (b[this.state.sortField] - a[this.state.sortField])).slice((page - 1) * pageSize, page * pageSize), totalSize: crm_records.length });
                }
                else {
                    this.setState({ paged_records: crm_records.sort((a, b) => (a[this.state.sortField] - b[this.state.sortField])).slice((page - 1) * pageSize, page * pageSize), totalSize: crm_records.length });
                }
            } else {
                if (sortOrder === "asc") {
                    this.setState({ paged_records: crm_records.sort((a, b) => (b[this.state.sortField] - a[this.state.sortField])), page: (this.props.page || 0) + 1, totalSize });
                }
                else {
                    this.setState({ paged_records: crm_records.sort((a, b) => (a[this.state.sortField] - b[this.state.sortField])), page: (this.props.page || 0) + 1, totalSize });
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.module !== this.props.module) {
            this.setState({ hidden: {}, all_fields: [] });
            if (!this.props.module_description) {
                this.props.getModuleDescription(this.props.module);
                this.props.getFieldView(this.props.module);
            }
        }
        // console.log(this.props.module, this.props.field_list);
        if (this.props.field_list && JSON.stringify(this.props.field_list) !== JSON.stringify(prevProps.field_list)) {
            this.setFields();
        }

        if (JSON.stringify(prevProps.crm_records) !== JSON.stringify(this.props.crm_records)) {
            this.setPage();
        }
    }

    render() {
        const { crm_records, field_list, module_description, onPageChange, pageSize = DEFAULT_PAGE_SIZE, totalSize, user } = this.props;
        const self = this;

        if (!crm_records || !field_list || !module_description) {
            return <Loader />;
        }
        // console.log("field_list", field_list);

        const { paged_records, page } = this.state;
        const sizePerPage = pageSize;

        const onTableChange = (type, value) => {
            const { sortField = undefined, sortOrder = undefined, page } = value;
            if (["pagination", "sort"].indexOf(type) > -1) {
                // if (crm_records.length > sizePerPage) {
                //     this.setState({ page, sortField, sortOrder }, () => {
                //         this.setPage();
                //     });
                // } else
                if (typeof onPageChange === "function") {
                    onPageChange(value.page - 1, value.sizePerPage, sortField, sortOrder);
                }
            }
        }

        const CustomToggleList = ({
            columns,
            onColumnToggle,
            toggles
        }) => {
            // console.log("columns", columns);
            return <div>
                {
                    columns
                        .map(column => ({
                            ...column,
                            toggle: toggles[column.dataField]
                        }))
                        .map(column => {
                            if (column.text) {
                                return <FormGroup key={column.dataField} check>
                                    <Label check>
                                        <Input checked={column.toggle} onClick={() => {
                                            self.setState({ hidden: { ...self.state.hidden, [column.dataField]: column.toggle } })
                                            onColumnToggle(column.dataField)
                                        }} type="checkbox" id="checkbox2" />{' '}
                                        {column.text}
                                    </Label>
                                </FormGroup>
                            } else {
                                return undefined;
                            }
                        })
                }
            </div>
        };

        const columns = [...this.state.all_fields.map(({ name, label }, index) => {
            const field = _.find(module_description, { name });
            if (field) {

                if (field.type.name === "owner") {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name],
                        sort: true,
                        formatter: (cellContent) => {
                            return (
                                <FieldValue module={"Users"} id={cellContent} />
                            );
                        }
                    }
                }

                if (field.type.name === "reference") {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name] || (this.props.parent_module === field.type.refersTo.toString()),
                        sort: true,
                        formatter: (cellContent) => {
                            return (
                                <FieldValue module={field.type.refersTo} id={cellContent} />
                            );
                        }
                    }
                }

                if (field.name === "description" || field.name === "commentcontent") {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name],
                        sort: true,
                        formatter: (cellContent) => {
                            return (
                                <div className='table_long_text'>{cellContent}</div>
                            );
                        }
                    }
                }

                if (field.type.name === "date" || field.type.name === "datetime") {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name],
                        sort: true,
                        formatter: (cellContent) => {
                            return correctDate(cellContent, field.type.name === "date");
                        }
                    }
                }

                if (CRM_FIELDS_ASSET.indexOf(name) > -1) {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name],
                        sort: true,
                        formatter: (cellContent) => {
                            return (
                                <FieldValue module={"Assets"} id={cellContent} />
                            );
                        }
                    }
                }

                if (name === "ticketstatus") {
                    return {
                        dataField: name,
                        text: label,
                        hidden: this.state.hidden[name],
                        sort: true,
                        classes: (cellContent) => {
                            return `col-status bg-${TICKET_STATUS_COLORS[cellContent]?.toUpperCase()}`
                        }
                    }
                }

                return {
                    dataField: name,
                    text: label,
                    hidden: this.state.hidden[name],
                    sort: true,
                    formatter: (cellContent) => {
                        return cellContent?.split("|##|").map((a) => a.trim()).join(", ")
                    }
                }
            }
        }), {
            dataField: 'extension_id',
            text: '',
            headerStyle: {
                width: 80
            },
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Button className='mr-1' size="sm" outline onClick={() => this.handleViewRow(row)} color="primary" title='View'><i className="fa fa-eye" ></i></Button>
                        {this.props.editable ? <Button size="sm" className='mr-1' outline onClick={() => this.handleEditRow(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button> : ""}

                        {this.props.deletable ? <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" title='Delete' ></i></Button> : ""}
                    </div>
                );
            }
        }].filter(a => a);

        const expandRow = this.props.module !== "ModComments" ? this.expandRow : undefined;

        // console.log("columns", columns);
        // console.log("paged_records", paged_records);

        return (
            paged_records && columns && paged_records.length > 0 && columns.length > 0 ? <ToolkitProvider
                keyField="id"
                data={paged_records}
                columns={columns}
                columnToggle
            >{
                    props =>
                        <Row>
                            <Col xs={this.props.showLegend ? 10 : 12}>
                                <div style={{ position: "relative" }}>
                                    <BootstrapTable
                                        onTableChange={onTableChange}
                                        remote={typeof onPageChange === "function"}
                                        wrapperClasses="table-responsive"
                                        classes="mb-2 bg-white"
                                        {...props.baseProps}
                                        defaultSorted={defaultSorted}
                                        sortField={this.state.sortField}
                                        sortOrder={this.state.sortOrder}
                                        pagination={paginationFactory({ paginationSize: 5, page: page, sizePerPage, totalSize, hideSizePerPage: true, withFirstAndLast: true })}
                                        expandRow={expandRow}

                                    />
                                </div>
                            </Col>
                            {
                                this.props.showLegend ?
                                    <Col xs="2">
                                        <CustomToggleList btnClassName="btn-outline" {...props.columnToggleProps} />
                                    </Col> : ""}
                        </Row>
                }
            </ToolkitProvider> : <span>No data available</span>
        );
    }
}

function mapStateToProps({ crm_records_page, field_list, module_description }, props) {
    return {
        field_list: field_list[props.module],
        crm_records: props.crm_records || crm_records_page[props.module],
        module_description: module_description[props.module],
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFieldView,
        getModuleDescription,
        getAllRecordsByPage,
        setSortOrder
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CrmTable);