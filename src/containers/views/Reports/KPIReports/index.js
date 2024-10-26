import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateGroup from './create';

import KPITable from './table';


class KPIReports extends Component {
    render() {
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">KPI Analyzer</li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3" style={{ width: 300 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateGroup />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report</CardHeader>
                            <CardBody>
                                <KPITable />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default KPIReports;
