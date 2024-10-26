import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { checkPermission } from '../../../config/util';
import Loader from '../../../components/Loader';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import firebaseConfig from '../config/firebase';
import { MESSENGER_CLIENT } from '../../../config/globals';
import ConnectWhatsApp from './create';
import { deleteSession } from '../action';

firebase.initializeApp(firebaseConfig);

const Configuration = () => {
    const [hasWriteAccess, setWriteAccess] = useState(false);
    const [showNewChannel, setShowNewChannel] = useState(false);

    const firestore = firebase.firestore();
    const query = firestore.collection(`accounts/${MESSENGER_CLIENT}/wa-accounts`);
    const [connections, loading, error] = useCollectionData(query);

    useEffect(() => {
        setWriteAccess(checkPermission('Dashboard', 'WRITE'));
    }, []);

    const deleteConfig = (waId) => {
        if(window.confirm("Are you sure you want delete this configuration?")){
            deleteSession(waId);
        }
    }

    const columns = [{
        dataField: "channel",
        text: '',
        headerStyle: {
            width: 40
        },
        formatter: (cellContent) => {
            return (
                <div className='text-center'>
                    <i className={`fa fa-whatsapp`}></i>
                </div>
            );
        }
    }, {
        dataField: "name",
        text: 'Name'
    },
    {
        dataField: "id",
        text: '',
        headerStyle: {
            width: 60
        },
        hidden: !hasWriteAccess,
        formatter: (cellContent, row) => {
            return (
                <div className="d-flex justify-content-around">
                    <Button size="sm" outline onClick={() => deleteConfig(cellContent)} color="danger"><i className="fa fa-trash" ></i></Button>
                </div>
            );
        }
    }];

    return (
        <div className="animated fadeIn">
            <ol className="breadcrumb">
                <li className="breadcrumb-item active">Channel Configurations</li>
                <li className="breadcrumb-menu">
                    <div className="btn-group">
                        <button onClick={() => setShowNewChannel(true)} className="btn"><i className="fa fa-plus"></i> New Channel</button>
                    </div>
                </li>
            </ol>
            <div className="container-fluid">
                <div className="d-flex justify-content-between">
                    <div className="flex-grow-1" >
                        <Card className="flex-grow-1">
                            <CardHeader>Channels</CardHeader>
                            <CardBody>
                                {loading ? <Loader /> : connections && connections.length > 0 ? <BootstrapTable keyField='id' data={connections} columns={columns} /> : "No Records Found"}
                            </CardBody>
                        </Card>
                    </div>
                    {showNewChannel ? <div className="ml-3" style={{ flexShrink: 0, width: 300 }} >
                        <Card>
                            <CardHeader>New Channel</CardHeader>
                            <CardBody>
                                <ConnectWhatsApp onSubmit={() => setShowNewChannel(false)} />
                            </CardBody>
                        </Card>
                    </div> : ""}
                </div>
            </div>
        </div>
    );
}

export default Configuration;
