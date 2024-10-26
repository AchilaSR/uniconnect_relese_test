import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, Card, CardHeader } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { tagLocation } from '../action';

class TagLocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tag: ""
        };
    }

    componentDidMount() {
        this.setState({ location_id: this.props.location_id, tag: "" })
    }

    componentDidUpdate() {
        if (this.props.location_id !== this.state.location_id) {
            this.setState({ location_id: this.props.location_id, tag: "" })
        }
    }

    sendSMS(e) {
        e.preventDefault();

        this.props.tagLocation({
            location_id: this.state.location_id,
            tag: this.state.tag,
        }, (err) => {
            this.setState({ tag: "" });
            this.props.onSaved();
        });
    }

    render() {
        return (
            <Card>
                <CardHeader>Tag Location</CardHeader>
                <CardBody>
                    <form onSubmit={(e) => this.sendSMS(e)}>
                        <Row>
                            <Col xs="12">
                                <FormGroup>
                                    <Label htmlFor="name">Tag</Label>
                                    <Input rows="5" required type="textarea" placeholder="Enter a Vehicle Number, Reference, etc." value={this.state.tag} onChange={(e) => this.setState({ tag: e.target.value })} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <div className="ml-auto" >
                                    <Button type="button" onClick={() => this.props.onSaved()} color="danger">Close</Button>
                                    <Button className="ml-1" type="submit" color="primary">Submit</Button>
                                </div>
                            </Col>
                        </Row>
                    </form>
                </CardBody>
            </Card>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        tagLocation
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(TagLocation));