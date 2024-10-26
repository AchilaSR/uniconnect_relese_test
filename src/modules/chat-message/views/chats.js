import React, { useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { Row, Col } from 'reactstrap';
import moment from 'moment';

const Emails = (chatMessages) => {
    const [messages, setMessages] = useState(chatMessages.chats);

    return (
        <div>
            <Row className="mb-3">
                <Col>
                    <ScrollToBottom followButtonClassName="scroll-button" className={`message-container`}>
                        {messages.map((m) => (
                            <div key={m.id} className={`'text-right'`}>
                                <div
                                    className={`bordered rounded mb-1 p-2 d-inline-block ${"bg-light"
                                        }`}
                                    style={{ maxWidth: '90%' }}
                                >
                                    <div className="text-left">{m.channel === 'sms'? <i className='fa fa-comments' /> : <i className='fa fa-envelope' />} {m.agent ? m.agent: "Anonymous"} </div>
                                    <div className="text-left">{m.content.body}</div>
                                    <small>{moment(m.date_time).format('YYYY-MM-DD HH:mm:ss')}</small>
                                </div>
                            </div>
                        ))}
                    </ScrollToBottom>
                </Col>
            </Row>
        </div>
    );
};

export default Emails;
