import React, { useState } from 'react';
import { Button, Col, InputGroup, Input, InputGroupAddon, InputGroupText, Row, FormText, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';


const validate = values => {
    const errors = {};
    if (!values.username) {
        errors.username = "Please enter the username";
    }
    if (!values.password) {
        errors.password = "Please enter the Password";
    }
    return errors;
}

const renderField = ({
    input,
    label,
    type,
    icon,
    meta: { touched, error, warning }
}) => (
    <FormGroup className="mb-3">
        <InputGroup>
            <InputGroupAddon addonType="prepend">
                <InputGroupText>
                    <i style={{ color: "#000" }} className={icon}></i>
                </InputGroupText>
            </InputGroupAddon>
            <Input {...input} type={type} placeholder={label} /><br />
        </InputGroup>
        {touched && ((error && <FormText color="danger">{error}</FormText>))}
    </FormGroup>
)

let LoginForm = props => {
    const { handleSubmit, submitting } = props
    const [isLoading, setIsloading] = useState(false);
    return (
        <form onSubmit={handleSubmit}>
            <Field component={renderField} icon="fa fa-user" type="text" label="Username" name="username" />
            <Field component={renderField} icon="fa fa-key" type="password" label="Password" name="password" />
            <Row>
                <Col xs="6">
                    <Button onClick={() => { setIsloading(true); setTimeout(() => { setIsloading(false) }, 10000) }} disabled={submitting} type="submit">{isLoading ? <i className='fa fa-spin fa-circle-o-notch'></i> : ""} Login</Button>
                </Col>
            </Row>
        </form>
    );
}


export default reduxForm({
    form: 'login',
    validate
})(LoginForm);