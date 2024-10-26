import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getLocationHistory } from '../action';
import Loader from '../../../components/Loader';
import LocationTable from './history-table';
import Filter from './history-filter';
import { CSVLink } from 'react-csv';
import { getReportData } from '../../../config/util';
import TagLocation from './tag';
import { loadAgents } from '../../../actions/reports';

class LocationTracker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            create: false
        }
    }

    componentWillMount() {
        this.props.getLocationHistory();
        this.props.loadAgents();
    }

    closeMap(create) {
        this.setState({ userLocation: undefined, distance: undefined, phone: undefined, create, customer: undefined });
    }

    render() {
        const { location_history } = this.props;
        const { user_locations } = this.state;
        const { data, headers } = getReportData(user_locations);

        if (!location_history) {
            return <Loader />
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Message History</li>
                    {user_locations && user_locations.length > 0 ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <CSVLink data={data} headers={headers} filename={"user_locations.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {this.props.location_history && !this.state.location_id ?
                            <div> <Filter user_locations={location_history} onFiltered={(user_locations) => this.setState({ user_locations })} /></div>
                            : ""}
                        <Card className="flex-grow-1">
                            <CardHeader>Customer Location</CardHeader>
                            <CardBody>
                                <LocationTable user_locations={user_locations} onTagClicked={(id) => this.setState({ location_id: id })} />
                            </CardBody>
                        </Card>
                        {this.state.location_id ?
                            <div className='ml-3' style={{ flexShrink: 0, width: 300 }}> <TagLocation location_id={this.state.location_id} onSaved={() => this.setState({ location_id: undefined })} /></div>
                            : ""}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ location_history }) {
    return {
        location_history
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getLocationHistory,
        loadAgents
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(LocationTracker));
