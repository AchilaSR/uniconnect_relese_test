import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, FormGroup, Label, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { login } from '../action';

const PasswordLogin = ({ generateOtp, login }) => {
    const [isLoading, setIsloading] = useState(false);
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    const callLogin = (e) => {
        e.preventDefault();
        setIsloading(true);
        login({user, password}, (error) => {
            setIsloading(false);
        })
    }



    return (
        <div>
            {
                <Form onSubmit={(e) => callLogin(e)}>
                    <Row>
                        <Col>
                            <FormGroup>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText><i className='fa fa-user text-dark'></i></InputGroupText>
                                    </InputGroupAddon>
                                    <Input required name='exampleEmail' value={user} onChange={(e) => { setUser(e.target.value) }} placeholder='Extension' />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText><i className='fa fa-key text-dark'></i></InputGroupText>
                                    </InputGroupAddon>
                                    <Input required type='password' value={password} onChange={(e) => { setPassword(e.target.value) }} placeholder='Password' />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">
                            <Button disabled={isLoading} type="submit">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Login</Button>
                        </Col>
                    </Row>
                </Form>
            }
        </div>
    );
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        login
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(PasswordLogin));