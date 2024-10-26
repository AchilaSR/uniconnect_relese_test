import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { checkPermission, formatDateTime } from '../../../config/util';
import Loader from '../../../components/Loader';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { connect } from 'react-redux';



const Table = ({ smsReport, onPageChange, pagination }) => {
   
    if(!smsReport){
        return <Loader />;
    }
    

    const columns = [

    {
        dataField: "Date_time",
        text: "Time",
        headerStyle: {
            width: 100
        },
        // formatter: (cellContent) => {
        //     return (
        //         formatDateTime(cellContent)
        //     );
        // }
    }, {
        dataField: "from",
        text: 'From',
        headerStyle: {
            width: 200
        },
        // formatter: (cellContent, row) => {
        //     console.log(cellContent, row);
        //     return <div>{row.from}<br /><small>{cellContent}</small></div>;
        // }
    }, 
    {
        dataField: "to",
        text: 'To',
        headerStyle: {
            width: 100
        },
        // formatter: (cellContent, row) => {
        //     return <div>{row.to}<br /><small>{cellContent}</small></div>;
        // }
    },{
        dataField: "content.body",
        text: 'Message',
        // formatter: (cellContent, row) => {
        //     let message = [];
        //     message.push(<div key="text" style={{ minWidth: 100 }}>{row.content.body}</div>)
        //     return <div className='d-flex'>{message}</div>;
        // }
    },
   
];



    return (
        smsReport && smsReport.data && smsReport.data.length > 0 ?
            <BootstrapTable
            remote
                pagination={paginationFactory({ hideSizePerPage: true ,  totalSize: smsReport.totalCount, page :pagination.page, sizePerPage: pagination.sizePerPage,  onPageChange: onPageChange,
            })}
                keyField='id' data={smsReport.data}
                columns={columns}
            />
            : "No Records Found"
    );
}

const mapStateToProps = state => ({
    smsReport: state.sms_report
});

export default connect(mapStateToProps) (Table);
