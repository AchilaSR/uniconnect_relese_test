import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, Alert, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendLocation, getLocation } from '../action';
import { INTL_PHONE_REGEX, LOCAL_PHONE_NUMBER_LENTGH, LOCAL_PHONE_NUMBER_PREFIX, LOCAL_PHONE_REGEX, LOCATION_TRACKER_LINK, SUPPORT_IDD_NUMBERS } from '../../../config/globals';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            phone: "",
            status: "",
            form_error: "",
        };
    }

    componentDidMount() {
        // if (this.props.phone) {
        //     this.setState({ phone: this.props.phone })
        // }

        if (this.props.customer) {
            this.setState({ customer: this.props.customer, message: `https://maps.google.com/?q=${this.props.customer.lat},${this.props.customer.lng}`.trim() })
        }
    }

    componentDidUpdate(prevProps) {
        // if (prevProps.phone !== this.props.phone) {
        //     this.setState({ phone: this.props.phone })
        // }

        if (!this.props.customer) {
            if (prevProps.customer) {
                this.setState({ customer: this.props.customer, message: "" })
            }
        } else if (prevProps.customer !== this.props.customer) {
            this.setState({ customer: this.props.customer, message: `https://maps.google.com/?q=${this.props.customer.lat},${this.props.customer.lng}`.trim() })
        }
    }

    sendLocation(e) {
        e.preventDefault();
        const self = this;

        console.log(LOCAL_PHONE_REGEX);
        if ((SUPPORT_IDD_NUMBERS && INTL_PHONE_REGEX.test(this.state.phone)) || LOCAL_PHONE_REGEX.test(this.state.phone)) {
            const phone = LOCAL_PHONE_NUMBER_PREFIX + this.state.phone.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH);

            this.props.sendLocation({
                number: phone,
                message: `Please click this link to share your location. ${LOCATION_TRACKER_LINK}?id=${phone}`,
                isLocationTracking: true
            }, (err) => {
                if (!err) {
                    const customer = {
                        data: {
                            phone
                        }
                    };
                    this.setState({ status: "Location link sent", customer: null });
                    self.props.onLocationChanged(customer);

                    const refreshLocation = setInterval(() => {
                        self.props.getLocation(phone, (res) => {
                            if (res.length > 0) {
                                self.setState({ status: res[0].status });
                                customer.status = parseFloat(res[0].status);
                                customer.last_updated_on = res[0].last_updated_on;
                                if (parseInt(res[0].status, 10) === 3) {
                                    customer.lat = parseFloat(res[0].latitude);
                                    customer.lng = parseFloat(res[0].longitude);
                                    clearInterval(refreshLocation);
                                }
                                self.setState({ customer });
                                console.log("customer", customer)
                                self.props.onLocationChanged({ ...customer })
                            }
                        })
                    }, 3000)
                }
            });
        } else {
            this.setState({ phone_error: "Please enter a valid mobile phone number" });
        }
        return false;
    }

    sendSMS(e) {
        e.preventDefault();

        if ((SUPPORT_IDD_NUMBERS && INTL_PHONE_REGEX.test(this.state.phone)) || LOCAL_PHONE_REGEX.test(this.state.phone)) {
            this.props.sendLocation({
                number: this.state.phone,
                message: this.state.message,
                isLocationTracking: false
            }, (err) => {
                this.setState({ status: 9 });
                this.clearForm();
            })
        } else {
            this.setState({ phone_error: "Please enter a valid mobile phone number" });
        }
    }

    showStatus() {
        switch (parseInt(this.state.status, 10)) {
            case 1:
                return <Alert color="secondary">Location Link Sent</Alert>
            case 2:
                return <Alert color="info"><span><i className="fa fa-circle-o-notch fa-spin"></i> Location Capturing is in Progress</span></Alert>;
            case 3:
                setTimeout(() => {
                    this.setState({ status: "", phone: "" })
                }, 5000)
                return <Alert color="success">Location Captured</Alert>;
            case 9:
                setTimeout(() => {
                    this.setState({ status: "", phone: "" })
                }, 5000)
                return <Alert color="success">Message Sent Successfully</Alert>;
            default:
                return "";
        }
    }

    clearForm() {
        this.setState({ message: "" });
    }

    fillLocation() {
        this.setState({ message: `${this.state.message}\nhttps://maps.google.com/?q=${this.state.customer.lat},${this.state.customer.lng}`.trim() })
    }

    render() {
        return (
            <CardBody>
                {
                    this.showStatus()
                }

                <form onSubmit={(e) => this.sendLocation(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Phone Number</Label>
                                <Input type="text" placeholder="947XXXXXXXX" value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value, phone_error: "" })} required />
                                {
                                    this.state.phone_error ?
                                        <FormText color="danger">
                                            {this.state.phone_error}
                                        </FormText> : ""
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                    {this.state.message === "" ?
                        <div>
                            <Row>
                                <Col className="text-right">
                                    <Button type="submit" color="primary" >Capture Customer Location</Button>{' '}
                                    {/* <Button type="button" onClick={() => {
                                const customer = {
                                    lat: 6.8398,
                                    lng: 79.9112,
                                    data: {
                                        phone: "0987654321"
                                    }
                                };
                                this.setState({ customer });
                                this.props.onLocationChanged(customer);
                            }} color="secondary">Test Location Link</Button>{' '} */}
                                </Col>
                            </Row>
                            <hr />
                        </div> : ""}
                </form>


                <form onSubmit={(e) => this.sendSMS(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Message</Label>
                                <Input rows="5" required type="textarea" placeholder="Enter a Message" value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex">
                            {this.state.customer ? <Button type="button" onClick={() => this.fillLocation()} outline color="secondary">Copy Location</Button> : ""}
                            <Button className="ml-auto" type="submit" color="primary">Send SMS</Button>
                        </Col>

                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        sendLocation,
        getLocation
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(Create));