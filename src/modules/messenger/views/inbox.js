import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import Filter from './filter';
import Table from './table';
import Reply from './reply';
import { SMSReport } from '../action';


const Inbox = ({ dispatch }) => {
    const [filter, setFilter] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [selectedMessage, selectMessage] = useState(null);


    useEffect(() => {
        if (filter) {
            dispatch(SMSReport(filter.startDate, filter.endDate, filter.to || "", filter.from || "",  limit, (page - 1) * limit,));
        }
    }, [limit, page, filter])


    const handlePageChange = (page, sizePerPage) => {
        setLimit(sizePerPage);
        setPage(page);
    };


    const handleFilterSubmit = (filter) => {
        setPage(1);
        setFilter(filter);
    };

    return (
        <div className="animated fadeIn">
            <ol className="breadcrumb">
                <li className="breadcrumb-item active">Message Inbox</li>
            </ol>
            <div className="container-fluid">
                <div className="d-flex justify-content-between">
                    {!selectedMessage ? <div className="mr-3" style={{ flexShrink: 0, width: 300 }} >
                        <Card>
                            <CardHeader>Filter</CardHeader>
                            <CardBody>
                                <Filter value={filter} onSubmit={handleFilterSubmit} />
                            </CardBody>
                        </Card>
                    </div> : ""}
                    <div className="d-flex flex-grow-1">
                        <Card className="flex-grow-1">
                            <CardHeader>Message Inbox</CardHeader>
                            <CardBody>
                                <Table onSelected={(selected) => selectMessage(selected)} pagination={{ page: page, sizePerPage: limit }} onPageChange={handlePageChange} />
                            </CardBody>
                        </Card>
                    </div>
                    {selectedMessage ? <div className="ml-3" style={{ flexShrink: 0, width: 300 }} >
                        <Reply onSubmit={() => selectMessage()} mobile={selectedMessage.from} />
                    </div> : ""}
                </div>
            </div>
        </div>
    );
}

export default connect()(Inbox);
