import React, { Component } from 'react';
import { Row } from 'reactstrap';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFieldView, getModuleDescription, searchRecords } from '../../action';
import Loader from '../../../../components/Loader';
import BootstrapTable from 'react-bootstrap-table-next';
import FieldValue from '../components/FieldValue';
import correctDate from '../components/dateField';

class TableWidget extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {};
    }

    componentWillMount() {
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    componentDidMount() {
        if (!this.props.field_list) {
            this.props.getFieldView(this.props.module_name);
            this.props.getModuleDescription(this.props.module_name);
        }
    }

    loadData() {
        const { module_name, search_fileds, sortField, values } = this.props;
        this.props.searchRecords(module_name, search_fileds.join(" AND "), (err, data) => {
            if (!err) {
                this.setState({ data });
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data) {
            return <div>No data available</div>
        }

        if (!this.props.field_list || !this.props.module_description) {
            return <Loader />
        }

        const { module_description } = this.props;

        const columns = this.props.selectedFields.map((name) => {
            const field = _.find(module_description, { name });

            if (field) {
                if (field.type.name === "owner") {
                    return {
                        dataField: name,
                        text: field.label,
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
                        text: field.label,
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
                        text: field.label,
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
                        text: field.label,
                        sort: true,
                        formatter: (cellContent) => {
                            return correctDate(cellContent, field.type.name === "date");
                        }
                    }
                }

                return {
                    dataField: name,
                    text: field.label,
                    sort: true,
                    formatter: (cellContent) => {
                        return cellContent?.split("|##|").map((a) => a.trim()).join(", ")
                    }
                }
            }
        });

        console.log("columns", columns);

        return <div>
                {
                    <BootstrapTable
                        wrapperClasses="table-responsive"
                        classes="mb-2 bg-white"
                        keyField="id"
                        data={this.state.data}
                        columns={columns}
                        pagination={paginationFactory({ hideSizePerPage: true })}
                    />
                }
        </div>;
    }
}

function mapStateToProps({ field_list, module_description }, props) {
    return {
        field_list: field_list[props.module_name],
        module_description: module_description[props.module_name]
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords,
        getFieldView,
        getModuleDescription
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(TableWidget));