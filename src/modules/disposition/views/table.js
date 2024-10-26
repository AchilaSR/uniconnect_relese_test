import React, { Component } from 'react';
import { Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { formatDuration, formatTimeToSeconds } from '../../../config/util'
import paginationFactory from 'react-bootstrap-table2-paginator';
import moment from 'moment';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';

class DispositionTable extends Component {

    isValidJSON(str) {
        try {
          JSON.parse(str);
          return true;
        } catch (error) {
          return false;
        }
      }

    render() {
        const { data, onEdit, editable } = this.props;

        const columns = [
            {
                dataField: 'start_time',
                text: 'Start Time',
                headerStyle: {
                    width: 90
                }
            }, {
                dataField: 'end_time',
                text: 'End Time',
                headerStyle: {
                    width: 90
                }
            }, {
                dataField: 'handling_time',
                text: 'Handling Time',
                formatter: (cell, row) => {
                    return formatDuration(formatTimeToSeconds(cell));
                },
                headerStyle: {
                    width: 80
                }
            }, {
                dataField: 'exceeded_time',
                text: 'Exceeded Time',
                formatter: (cell, row) => {
                    if (cell) {
                        return formatDuration(cell);
                    } else {
                        return "";
                    }
                },
                classes: "text-danger",
                headerStyle: {
                    width: 80
                }
            }, {
                dataField: 'direction',
                text: 'Direction',
                headerStyle: {
                    width: 80
                },
                classes: "text-uppercase text-center"
            }, {
                dataField: 'agent_extension',
                text: 'Agent',
                headerStyle: {
                    width: 80
                },
                formatter: (cell, row) => {
                    return `${cell}: ${row.agent_name}`
                },
            }, {
                dataField: 'customer_number',
                text: 'Customer',
                headerStyle: {
                    width: 80
                }
            },
            {
                dataField: 'category',
                text: 'Disposition',
                formatter: (cell, row) => {
                        if (!row.disposition_data) {
                          return "";
                        }
                        if (this.isValidJSON(row.disposition_data)) {
                            const parsedData = JSON.parse(row.disposition_data);
                            if (parsedData.data && Array.isArray(parsedData.data)) {
                                return (
                                    <ul className='form-list'>
                                        {parsedData.data.map(([key, value], index) => value ? <li key={index}><label>{key}</label> {value}</li> : "")}
                                    </ul>
                                );
                            } else {
                                return (
                                    <ul className='form-list'>
                                        {Object.entries(parsedData).map(([key, value], index) => {
                                            if (key === 'disposition' && Array.isArray(value)) {
                                                return value.map(([dispositionKey, dispositionValue], dispositionIndex) => (
                                                    <li key={dispositionIndex}><label>{dispositionKey}</label> {dispositionValue}</li>
                                                ));
                                            } else {
                                                return <li key={index}><label>{key}</label> {value}</li>;
                                            }
                                        })}
                                    </ul>
                                );
                            }
                        } else {
                            return row.disposition_data;
                        }
                      
                }
            },
            // {
            //     dataField: 'id',
            //     text: '',
            //     headerStyle: {
            //         width: 60
            //     },
            //     hidden: !editable,
            //     formatter: (cellContent, row) => {
            //         return (
            //             <div className="d-flex justify-content-around">
            //                 <Button size="sm" outline onClick={() => onEdit(row)} color="primary" title='Edit'><i className="fa fa-pencil" ></i></Button>
            //             </div>
            //         );
            //     },
            //     hidden: DYNAMIC_DISPOSITION_FORMS
            // }
        ];

        return (
            data && data.length > 0 ? <BootstrapTable keyField='id' data={data.sort((a, b) => b.start_time - a.start_time)} pagination={paginationFactory({ hideSizePerPage: true })} columns={columns} /> : "No Records Found"
        );
    }
}

export default DispositionTable;
