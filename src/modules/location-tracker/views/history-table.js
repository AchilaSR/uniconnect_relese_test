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
      dataField: 'sent_on',
      text: 'Sent On',
      headerStyle: {
        width: 100
      },
      // sort: true
    }, {
      dataField: 'type',
      text: 'Type',
      headerStyle: {
        width: 100
      }
    }, {
      dataField: 'customer_number',
      text: 'Customer Number',
      headerStyle: {
        width: 100
      }
    }, {
      dataField: 'agent_extension',
      text: 'Agent',
      headerStyle: {
        width: 100
      },
      formatter: (cellContent, row) => {
        return (
          `[${cellContent}] ${row.agent_name}`
        );
      }
    }, {
      dataField: 'message',
      text: 'Message'

      
    }, {
      dataField: 'id',
      text: 'Tag',
      headerStyle: {
        width: 60
      },
      formatter: (cellContent) => {
        return (
          <div className="d-flex justify-content-around">
            <Button size="sm" outline onClick={() => this.props.onTagClicked(cellContent)} color="primary"><i className="fa fa-tag" ></i></Button>
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
