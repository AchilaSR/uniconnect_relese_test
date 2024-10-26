import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col} from 'reactstrap';
import { connect } from 'react-redux';

import CreateUser from './create';
import ProfilePicture from './ProfilePicture';

class ProfileSettings extends Component {
    constructor(props) {
        super(props);
        this.toggleModel = this.toggleModel.bind(this);
    }

    toggleModel() {
        this.props.toggle();
    }

    render() {
        console.log();
        const profile = { ...this.props.user, ...this.props.user.user_details };
        return (
            <Modal size="lg" isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                <ModalHeader toggle={this.toggleModel}>Profile Settings</ModalHeader>
                <ModalBody style={{ maxHeight: 500, overflowY: "auto" }}>
                    <Row>
                        <Col md={4} className="px-5 py-4"><ProfilePicture extension={profile.extension} /></Col>
                        <Col md={8}><CreateUser own={true} user={profile} onClose={this.toggleModel} /></Col>
                    </Row>
                </ModalBody>
            </Modal>
        );
    }
}

function mapStateToProps({ user }) {
    return {
        user
    };
}
export default (connect(mapStateToProps, null)(ProfileSettings));
