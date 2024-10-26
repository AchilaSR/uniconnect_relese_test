import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import history from '../../../history';
import { createUser, updateUser, setMobileSettings, setOutboundID } from '../../../actions/users';
import { listExtensions } from '../../../actions/configurations';
import { LOCAL_PHONE_REGEX } from '../../../config/globals';
import { logout } from '../../../actions';
import Loader from '../../../components/Loader';

class CreateUser extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    saveData(e) {
        e.preventDefault();
        const self = this;
        this.props.onSearch(self.state)
    }

    render() {
        const { roles } = this.props;

        if (!roles) {
            return <Loader />
        }

        return (
            <form onSubmit={(e) => this.saveData(e)} >
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="first_name">Name</Label>
                            <Input onChange={(e) => this.setState({ name: e.target.value })} placeholder='ex: John Doe' type="text" value={this.state.name} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="login_username">Username</Label>
                            <Input onChange={(e) => this.setState({ username: e.target.value })} placeholder='ex: 1000' type="text" value={this.state.username} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.role}
                                options={roles}
                                onChange={(e) => this.setState({ role: e })}
                                getOptionValue={option => option['role_id']}
                                getOptionLabel={option => option['name']}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button type="submit" color="primary">Search</Button>{' '}
                        <Button onClick={() => this.setState({ name: "", username: "", role: null }, () => {
                            this.props.onSearch({})
                        })} color="danger">Cancel</Button>
                    </Col>
                </Row>
            </form>
        );
    }
}

function mapStateToProps({ roles, groups, outbound_ids }) {
    return {
        roles, groups, outbound_ids
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listExtensions,
        createUser,
        logout,
        updateUser,
        setMobileSettings,
        setOutboundID
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(CreateUser));
