import React, { Component } from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import _ from 'lodash';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Loader from '../../../components/Loader';
import { Button } from 'reactstrap';
import { deleteLocation } from '../action';
import { bindActionCreators } from 'redux';

import { STATUS_TEXTS } from '../config';

class LocationTable extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this.setState({ user_locations: this.props.user_locations })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user_locations !== this.props.user_locations) {
      this.setState({ user_locations: this.props.user_locations });
      console.log(this.props.user_locations);
    }
  }

  handleViewRow(row) {
    this.props.onLocationChanged({
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      status: parseFloat(row.status),
      last_updated_on: row.updatedon,
      data: {
        phone: row.msisdn
      }
    })
  }

  handleShareRow(row) {
    let customer;

    if (row.status === 3) {
      customer = {
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        data: {
          phone: row.msisdn
        }
      };
    }

    this.props.onSendLink(row.msisdn, customer);
  }

  handleDeleteRow(row) {
    if (window.confirm("Are you sure you want to delete this record?")) {
      this.props.deleteLocation(row.id);
    }
  }

  render() {
    const { user_locations } = this.state;

    if (!user_locations) {
      return <Loader />;
    }

    if (user_locations.length === 0) {
      return "No records found";
    }

    const columns = [{
      dataField: 'id',
      text: 'Reference',
    }, {
      dataField: 'msisdn',
      text: 'Customer Number',
      headerStyle: {
        width: 160
      }
    }, {
      dataField: 'status',
      text: 'Status',
      formatter: (cellContent) => (STATUS_TEXTS[cellContent].text),
      classes: (cellContent) => (`col-status bg-${STATUS_TEXTS[cellContent].color}`)
    }, {
      dataField: 'updatedon',
      text: 'Last Updated',
      headerStyle: {
        width: 160
      },
    }, {
      dataField: 'id',
      text: '',
      headerStyle: {
        width: 120
      },
      formatter: (cellContent, row) => {
        return (
          <div className="d-flex justify-content-around">
            <Button disabled={row.status !== 3} size="sm" outline onClick={() => this.handleViewRow(row)} color="primary" title='Location'><i className="fa fa-street-view" ></i></Button>
            <Button disabled={row.status !== 3} size="sm" outline onClick={() => this.handleShareRow(row)} color="primary" title='View'><i className="fa fa-share-square-o" ></i></Button>
            <Button size="sm" outline onClick={() => this.handleDeleteRow(row)} color="danger"><i className="fa fa-trash" title={"Delete"} ></i></Button>
          </div>
        );
      }
    }];
    return (
      <BootstrapTable pagination={paginationFactory({ hideSizePerPage: true })} keyField='id' data={user_locations} columns={columns} />
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    deleteLocation
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(LocationTable);
