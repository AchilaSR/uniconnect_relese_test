import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, FormGroup, Label } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generateOtp, validateOtp } from '../action';

const OtpLogin = ({ generateOtp, validateOtp }) => {
    const [isLoading, setIsloading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [extention, setExtension] = useState("");
    const [otp, setOtp] = useState("");

    const sendOtp = (e) => {
        e.preventDefault();
        setIsloading(true);
        generateOtp(extention, (error)=>{
            if(!error){
                setOtpSent(true);
            }
            setIsloading(false);
        })
    }

    const validate = (e) => {
        e.preventDefault();
        setIsloading(true);
        validateOtp(extention, otp, (error)=>{
            if(!error){
                setIsloading(false);
            }else{
                setOtp("");
            }
        })
    }

    return (
        <div>
            {
                !otpSent ? <Form onSubmit={(e) => sendOtp(e)}>
                    <Row>
                        <Col>
                            <FormGroup>
                                <Label>Extension</Label>
                                <Input name='exampleEmail' value={extention} onChange={(e) => { setExtension(e.target.value) }} placeholder='ex: 1000' />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">
                            <Button disabled={isLoading || !extention} type="submit">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Login</Button>
                        </Col>
                    </Row>
                </Form> :
                    <Form onSubmit={(e) => validate(e)}>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label>OTP</Label>
                                    <Input value={otp} onChange={(e) => { setOtp(e.target.value) }} placeholder='OTP sent to your 3CX app' />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="6">
                                <Button disabled={isLoading || !otp} type="submit">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Verify</Button>
                            </Col>
                        </Row>
                    </Form>
            }
        </div>
    );
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generateOtp,
        validateOtp
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(OtpLogin));