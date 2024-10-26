import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { Row, Col, FormGroup, Input, Button, Card, CardBody, CardHeader, Alert } from 'reactstrap';
// import { sendReply } from '../action';
import Modal from '../../../components/Modal';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import firebaseConfig from '../config/firebase';
import { MESSENGER_CLIENT } from '../../../config/globals';
import useScrollToBottom from 'react-scroll-to-bottom/lib/hooks/useScrollToBottom';
import { checkPermission } from '../../../config/util';
import Loader from '../../../components/Loader';

firebase.initializeApp(firebaseConfig);

const Reply = ({ mobile, onSubmit, showFrame = true }) => {
    const [auth, setAuth] = useState(false);
    const [reply, setReply] = useState("");
    const [message, setMessage] = useState();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsloading] = useState(false);
    const [selectedImg, selectImg] = useState();
    const [error, setError] = useState("");
    const scroll = useScrollToBottom();

    const firestore = firebase.firestore();

    useEffect(() => {
        setAuth(checkPermission('Unified Messaging', 'WRITE'));
    }, []);

    useEffect(() => {
        if (message) {
            console.log("message.id", message.id);
            firestore.collection(`accounts/${MESSENGER_CLIENT}/messages/${message.id}/messages`).orderBy('time', 'asc').onSnapshot(snapshot => {
                const m = []
                snapshot.forEach(doc => {
                    m.push(doc.data())
                });
                setMessages(m);
            }, err => {
                console.log(`Encountered error: ${err}`);
            });
        }
    }, [message]);

    useEffect(() => {
        if (mobile) {
            if (mobile === "94712345678")
                mobile = "94712728108";

            firestore.doc(`accounts/${MESSENGER_CLIENT}/messages/wa-${mobile}`).get().then((m) => {
                const d = m.data();
                if (d) {
                    d.id = m.id;
                    setMessage(d);
                } else {
                    setError("No messages from this contact");
                }
            }, err => {
                console.log(`Encountered error: ${err}`);
            });
        }
    }, [mobile]);

    useEffect(() => {
        scroll();
    }, [messages]);

    const save = (e) => {
        e.preventDefault();
        // sendReply({ msgId: message.id, message: reply }, () => {
        //     setIsloading(false);
        //     setReply("");
        // });
    }

    if (error) {
        return <Alert color='warning'>{error}</Alert>;
    }

    if (!message) {
        return <Loader />;
    }

    const renderMessages = () => {
        return <form onSubmit={(e) => save(e)}>
            <Row className="mb-3">
                <Col>
                    <ScrollToBottom followButtonClassName="scroll-button" className={`message-container ${auth ? "with-reply" : ""}`}>
                        {
                            messages.map((m) => {
                                return (<div key={m.id} className={`${m.direction === "sent" ? "text-right" : ""}`}>
                                    <div className={`bordered rounded mb-1 p-2 d-inline-block ${m.direction === "sent" ? "bg-primary" : "bg-light"}`} style={{ maxWidth: "90%" }}>
                                        {m.type === "image" ?
                                            <div className='cursor'><img onClick={() => selectImg(`data:${m.media_type};base64,${m.media}`)} style={{ maxHeight: 240, maxWidth: "100%" }} src={`data:${m.media_type};base64,${m.media}`} /></div> : ""}
                                        <div className='text-left'>{m.body || m.message}</div>
                                        <small>{moment(m.time).format("YYYY-MM-DD HH:mm:ss")}</small>
                                    </div>
                                </div>)
                            })
                        }
                    </ScrollToBottom>
                    {/* </div> */}
                </Col>
            </Row>
            {auth ?
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Input type="textarea" rows={3} placeholder="Enter the reply message" value={reply} onChange={(e) => setReply(e.target.value)} required />
                        </FormGroup>
                    </Col>
                </Row> : ""}
            <Row className="mt-3">
                <Col className="text-right">
                    <Button onClick={() => onSubmit()} type="button" color="danger">Close</Button>{' '}
                    {auth ? <Button onClick={() => setIsloading(true)} type="submit" color="primary">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Send</Button> : ""}
                </Col>
            </Row>
            <Modal size="lg" title="Image" toggle={() => { selectImg() }} isOpen={selectedImg}>
                <img style={{ width: "100%" }} src={selectedImg} />
            </Modal>
        </form>
    }

    // if (!showFrame) {
    //     return renderMessages();
    // }

    return (
        <Card>
            <CardHeader>{`${message.contact} [${message.from}]`}</CardHeader>
            <CardBody>
                {renderMessages()}
            </CardBody>
        </Card>
    );
}

export default Reply;