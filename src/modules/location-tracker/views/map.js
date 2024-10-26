import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleMapReact from 'google-map-react';
import { GOOGLE_MAP_KEY } from '../../../config/globals';
import Branch from '../markers/branch';
import User from '../markers/user';
import Loader from '../../../components/Loader';

const defaultProps = {
    zoom: 18
};

class GoogleMap extends Component {
    constructor(props) {
        super(props);
        this.routePolyline = null;
        this.state = {
            map: null,
            maps: null,
        };
    }

    rad(x) {
        return x * Math.PI / 180;
    }

    findClosestBranch() {
        const { lat, lng } = this.props.userLocation;
        const { locations } = this.props;
        var R = 6371; // radius of earth in km
        var distances = [];
        var closest = -1;
        for (let i = 0; i < locations.length; i++) {
            const branch = locations[i];
            var mlat = Math.floor(parseFloat(branch.latitute) * 1000000) / 1000000;
            var mlng = Math.floor(parseFloat(branch.logitute) * 1000000) / 1000000;
            var dLat = this.rad(mlat - lat);
            var dLong = this.rad(mlng - lng);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.rad(lat)) * Math.cos(this.rad(lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            distances[i] = d;
            if (closest == -1 || d < distances[closest]) {
                closest = i;
            }
        }

        return locations[closest];
    }

    renderPath(branch) {
        const { userLocation } = this.props;
        const { map, maps } = this.state;
        const directionsService = new maps.DirectionsService();
        const directionsDisplay = new maps.DirectionsRenderer();

        const origin = new maps.LatLng(userLocation.lat, userLocation.lng);
        const destination = new maps.LatLng(branch.lat, branch.lng);
        const service = new maps.DistanceMatrixService();

        const request = {
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING'
        };

        if (this.routePolyline) {
            this.routePolyline.setMap(null);
        }

        service.getDistanceMatrix(request,
            (response, status) => {
                if (status === "OK") {
                    console.log(response);
                    this.props.onPathChanged(response)
                }
            });

        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING'
        },
            (response, status) => {
                if (status === "OK") {
                    directionsDisplay.setDirections(response);
                    this.routePolyline = new maps.Polyline({
                        strokeColor: "#2980b9",
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        path: response.routes[0].overview_path
                    });
                    this.routePolyline.setMap(map);
                } else {
                    console.log(status, response);
                    window.alert("Directions request failed due to " + status);
                }
            }
        );

        const bounds = new maps.LatLngBounds()
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds);
    }

    changeCenter(location) {
        if (this.routePolyline) {
            this.routePolyline.setMap(null);
        }

        if (this.state.map) {
            this.state.map.setCenter(location);
            this.state.map.setZoom(defaultProps.zoom);
        }
    }

    render() {
        const { locations, userLocation } = this.props;
        if (!locations) {
            return <Loader />
        }

        return (
            <GoogleMapReact
                style={{ height: 500, overflow: "hidden" }}
                defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
                defaultZoom={defaultProps.zoom}
                bootstrapURLKeys={{ key: GOOGLE_MAP_KEY }}
                onGoogleApiLoaded={({ map, maps }) => this.setState({ map, maps })}
            >
                <User
                    lat={userLocation.lat}
                    lng={userLocation.lng}
                    data={userLocation.data}
                />

                {/* {
                    locations.map((branch) => {
                        branch.lat = Math.floor(parseFloat(branch.latitute) * 1000000) / 1000000;
                        branch.lng = Math.floor(parseFloat(branch.logitute) * 1000000) / 1000000;
                        return <Branch
                            lat={branch.lat}
                            lng={branch.lng}
                            data={branch}
                            key={branch.branch_name}
                            onClick={() => this.renderPath(branch)}
                        />
                    })
                } */}

            </GoogleMapReact>
        );
    }
}

function mapStateToProps({ locations }) {
    return {
        locations
    };
}

export default (connect(mapStateToProps, null)(GoogleMap));
