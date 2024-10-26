import React, { useEffect, useState } from 'react';
import { Row, Col, FormGroup, Label, Input, Button, ButtonGroup } from 'reactstrap';
import Loader from '../../../components/Loader';
// import QRCode from "react-qr-code";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebaseConfig from '../config/firebase';
import { MESSENGER_CLIENT } from '../../../config/globals';
import { generateQR } from '../action';

firebase.initializeApp(firebaseConfig);

const ConnectChannel = ({ onSubmit }) => {
    const [type, setType] = useState("whatsapp");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (generating) {
            generateQR();
        }
    }, [generating]);

    const firestore = firebase.firestore();
    const query = firestore.collection("accounts").doc(MESSENGER_CLIENT);
    const [data, loading, error] = useDocumentData(query);

    useEffect(() => {
        if (data && data["wa-qr-code-status"] === "AUTHENTICATED") {
            onSubmit();
        }
    }, [data]);

    return (
        <form onSubmit={(e) => this.save(e)}>
            <Row className="mb-3">
                <Col>
                    <ButtonGroup>
                        <Button style={{ width: 88 }} type="button" outline={type !== "whatsapp"} onClick={() => setType("whatsapp")} color="primary"><i className='fa fa-whatsapp'></i><br />WhatsApp</Button>
                        <Button style={{ width: 88 }} type="button" outline={type !== "messenger"} onClick={() => setType("messenger")} color="primary"><i className='fa fa-facebook'></i><br />Messenger</Button>
                        <Button style={{ width: 88 }} type="button" outline={type !== "fbpage"} onClick={() => setType("fbpage")} color="primary"><i className='fa fa-facebook'></i><br />FB Page</Button>
                    </ButtonGroup>
                </Col>
            </Row>
            <Row>
                {type === "whatsapp" ?
                    <Col md="12">
                        <FormGroup>
                            <Label htmlFor="name">Scan QR Code</Label>
                            <div className='text-center mt-1'>
                                {loading || generating ? <Loader /> :
                                    !data ? "Account not found" :
                                        data["wa-qr-code"] ?
                                            //  <QRCode value={data["wa-qr-code"]} size={250} /> 
                                            "QR"
                                            :
                                            <Button onClick={() => setGenerating(true)}>Generate Code</Button>
                                }
                            </div>
                        </FormGroup>
                    </Col> : ""}
            </Row>
        </form>
    );
}

export default ConnectChannel;