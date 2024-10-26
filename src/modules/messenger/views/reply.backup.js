import React, { useState } from 'react';
import { Row, Col, FormGroup, Input, Button } from 'reactstrap';
import { sendReply } from '../action';

const Reply = ({ message = {}, onSubmit }) => {
    const [reply, setReply] = useState("");
    const [isLoading, setIsloading] = useState(false);

    const save = (e) => {
        e.preventDefault();
        sendReply({ msgId: message.id, message: reply }, () => {
            setIsloading(false);
            onSubmit();
        });
    }

    const renderField = (label, value) => (
        <div className='mb-1'>
            <small>{label}</small><br />
            <strong>{value}</strong>
        </div>
    )

    return (
        <form onSubmit={(e) => save(e)}>
            <Row className="mb-3">
                <Col>
                    {renderField("Contact Name", message.contact)}
                    {renderField("From", message.from)}
                    {renderField("To", message.to)}
                    {renderField("Message", message.body)}
                    {message.type === "image" ?
                        <div><img style={{ width: "100%" }} src={`data:${message.media_type};base64,${message.media}`} /></div> : ""}
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <FormGroup>
                        <Input type="textarea" rows={5} placeholder="Enter the reply message" value={reply} onChange={(e) => setReply(e.target.value)} required />
                    </FormGroup>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col className="text-right">
                    <Button onClick={() => onSubmit()} type="button" color="danger">Cancel</Button>{' '}
                    <Button onClick={() => setIsloading(true)} type="submit" color="primary">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Send</Button>{' '}
                </Col>
            </Row>
        </form>
    );
}

export default Reply;