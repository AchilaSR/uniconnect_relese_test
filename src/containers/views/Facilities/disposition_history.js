import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import _ from 'lodash';
import Loader from '../../../components/Loader';
import { DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';

class DispostionHistory extends Component {

    render() {
        const { data } = this.props;

        if (!data) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'attempt',
            text: 'Attempt',
            classes: "text-right",
            headerStyle: {
                width: 65
            },
        }, {
            dataField: 'agent',
            text: 'Agent Name',
        }, {
            dataField: 'added_on',
            text: 'Added On',
            headerStyle: {
                width: 175
            },
        }];

        if (DYNAMIC_DISPOSITION_FORMS) {
            columns.push({
                dataField: 'disposition_data.data',
                text: 'Disposition',
                formatter: (cell) => {
                    if (!cell) {
                        return "";
                    }

                    return <ul className='form-list'>
                        {cell.map(([key, value], index) => value ? <li key={index}><label>{key}</label> {typeof value === "object" ? JSON.stringify(value) : value}</li> : "")}
                    </ul>
                }
            });
        } else {
            columns.push({
                dataField: 'disposition',
                text: 'Disposition',
            });
            columns.push({
                dataField: 'comment',
                text: `Agent's Comment`,
            });
        }

        return (
            <BootstrapTable classes="mb-0" keyField='added_on' data={data.sort((a, b) => b.attempt - a.attempt)} columns={columns} />
        );
    }
}

export default DispostionHistory;
