import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getLocations } from '../action';
import Loader from '../../../components/Loader';
import LocationTable from './table';
import Filter from './filter';
import { CSVLink } from 'react-csv';
import { getReportData } from '../../../config/util';

class LocationTracker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            create: false
        }
    }

    componentWillMount() {
        this.props.getLocations();
    }

    closeMap(create) {
        this.setState({ userLocation: undefined, distance: undefined, phone: undefined, create, customer: undefined });
    }

    render() {
        const { user_locations } = this.state;
        const { data, headers } = getReportData(user_locations);

        if (!this.props.user_locations) {
            return <Loader />
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Accident Location History</li>
                    {user_locations && user_locations.length > 0 ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={"user_locations.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div> <Filter user_locations={this.props.user_locations} onFiltered={(user_locations) => this.setState({ user_locations })} /></div>
                        <Card className="flex-grow-1">
                            <CardHeader>Customer Location</CardHeader>
                            <CardBody>
                                <LocationTable user_locations={user_locations} onSendLink={(phone, customer) => this.props.history.push("/location-tracker", { phone, userLocation: customer, customer })} onLocationChanged={(location) => this.props.history.push("/location-tracker", { userLocation: location })} />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ user_locations }) {
    return {
        user_locations
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getLocations
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(LocationTracker));
