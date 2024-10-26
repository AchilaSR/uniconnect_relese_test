import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Table, Alert } from 'reactstrap';
import Create from './create';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getBranches, getLocation } from '../action';
import Loader from '../../../components/Loader';
import loader from '../assets/loader.gif';
import Location from './location';
import GoogleMap from './map';
import Printable from '../../../components/Printable';
import { STATUS_TEXTS } from '../config';
import text from '../../../theme/texts.json';

class LocationTracker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            create: false
        }
    }

    componentWillMount() {
        this.props.getBranches();
    }

    closeMap() {
        this.props.history.push("/location-history");
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.state && !this.state.create) {
            const { userLocation, phone, customer } = this.props.location.state;
            if (JSON.stringify(this.state.userLocation) !== JSON.stringify(userLocation)) {
                // console.log(JSON.stringify(prevProps.location.state.userLocation), JSON.stringify(userLocation));

                this.setState({ userLocation })
            }

            if (prevProps.location.state.phone !== this.state.phone) {
                this.setState({ phone })
            }

            if (prevProps.location.state.customer !== this.state.customer) {
                this.setState({ customer })
            }
        }
    }

    render() {
        // const { locations } = this.props;
        const { userLocation } = this.state;

        // if (!locations) {
        //     return <Loader />
        // }
        console.log("userLocation", userLocation);
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Accident Location Tracker</li>
                    {this.props.location ?
                        <li className="breadcrumb-menu">
                            <div className="btn-group">
                                <a className="btn" onClick={() => this.closeMap()}><i className="fa fa-close"></i> Close</a>
                            </div>
                        </li>
                        : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {typeof userLocation !== "undefined" ?
                            <div className='mr-3 flex-grow-1'>
                                <Printable filename={`location-${this.state.userLocation.data.phone.trim()}`} title="Location Map">
                                    {userLocation ?
                                        <div>
                                            <div className='d-none d-print-block'>
                                                <h2>{text.title}</h2>
                                            </div>
                                            <Table style={{ width: "auto" }} size='sm' borderless className='text-left'>
                                                <tr>
                                                    <td>Customer Mobile</td>
                                                    <td>: {this.state.userLocation.data.phone}</td>
                                                </tr>
                                                <tr>
                                                    <td>Updated Time</td>
                                                    <td>: {this.state.userLocation.last_updated_on ? this.state.userLocation.last_updated_on : "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <td>Location</td>
                                                    <td>: {this.state.userLocation.lng && this.state.userLocation.lat ? <span>{this.state.userLocation.lat}<sup>o</sup> N, {this.state.userLocation.lng}<sup>o</sup> E</span> : "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td>: {this.state.userLocation.status ? STATUS_TEXTS[this.state.userLocation.status].text : "Location Pending"}</td>
                                                </tr>
                                            </Table>
                                            <hr />
                                            {
                                                parseInt(this.state.userLocation.status, 10) === 3 ?
                                                    <div style={{ position: "relative" }}>
                                                        <GoogleMap userLocation={this.state.userLocation} onPathChanged={(distance) => this.setState({ distance })} />
                                                    </div> : parseInt(this.state.userLocation.status, 10) === 4 ? <Alert color='danger' >Location Link Expired</Alert> : <div className='text-center'><img style={{ height: 200 }} src={loader} /></div>}
                                        </div>
                                        : <img style={{ height: 200 }} src={loader} />}
                                </Printable>
                            </div>
                            : ""}
                        <div style={{ flexShrink: 0, width: 300 }} >
                            <Card>
                                <CardHeader>
                                    Send Location Link
                                </CardHeader>
                                <Create phone={this.state.phone} customer={this.state.customer} onLocationChanged={(location) => this.setState({ userLocation: location, distance: undefined, create: true })} />
                            </Card>
                            {this.state.distance ?
                                <Location distance={this.state.distance} /> : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ locations }) {
    return {
        locations
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getBranches,
        getLocation
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(LocationTracker));
