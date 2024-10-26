import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Input, ListGroup, ListGroupItem } from 'reactstrap';
import _ from 'lodash';
import { withRouter } from 'react-router';
import DispositionForm from '../../../modules/disposition-forms/views/send';
import Modal from '../../../components/Modal';
import AddDispositionNote from '../../../modules/disposition-note-templates/views/send';
import { loadFollowUps, deleteFollowUps } from '../../../actions/facilities';
import { checkPermission } from '../../../config/util';
import { DYNAMIC_DISPOSITION_FORMS, FOLLOWUP_DISPOSITION } from '../../../config/globals';

class DefaultAside extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDispositionNote: false,
      followupAccess: false,
      customer: {},
      search: ""
    }
  }

  componentWillMount() {
    this.setState({ followupAccess: checkPermission('Followups Management', 'READ') });

    if (this.state.followupAccess) {
      this.props.loadFollowUps();
    }
  }

  handleEditRow(row) {
    this.props.history.push({
      pathname: "/leads/dial",
      search: `?search=${row.costomer_id}&searchBy=Lead%20ID&clickedReminder=true`
    })
  }

  handleDeleteRow(row) {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      const self = this;
      if (FOLLOWUP_DISPOSITION) {
        this.setState({
          showDispositionNote: true,
          customer: row,
          dispositionCallBack: () => {
            self.setState({ showDispositionNote: false });
            self.props.deleteFollowUps(row.costomer_id);
          }
        });
      } else {
        self.props.deleteFollowUps(row.costomer_id);
      }

    }
  }

  render() {
    const { followups } = this.props;

    if (!followups) {
      return "";
    }

    const filtered = followups.filter((a) => {
      return a.costomer_id.indexOf(this.state.search) > -1 ||
        a.followup_note.indexOf(this.state.search) > -1 ||
        a.due_on.indexOf(this.state.search) > -1 ||
        a.recovery_officer.indexOf(this.state.search) > -1 ||
        a.contract_number.indexOf(this.state.search) > -1
    })

    return (
      <div>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">Follow Ups</li>
        </ol>
        <div className='bg-light p-2'>
          <Input value={this.state.search} onChange={(e) => this.setState({ search: e.target.value })} placeholder='Search' />
        </div>
        <ListGroup className="list-group-accent" style={{ overflow: "auto", height: "calc(100vh - 100px)" }}>
          {
            _.orderBy(filtered, ['due_on'], ['asc']).map((f) => {
              return <ListGroupItem key={f.costomer_id} className={"list-group-item-divider " + f.color_code}>
                <div>
                  <strong>{f.costomer_id}</strong>
                  {f.followup_note.split("+++++++").map((a, index) =>
                    <p key={index} className='mb-0'>{a}</p>
                  )}
                  <div className="float-right">
                    <div onClick={() => this.handleEditRow(f)} className="call-button mr-1">
                      <i className="fa fa-phone" ></i>
                    </div>
                    <div onClick={() => this.handleDeleteRow(f)} className="call-button danger">
                      <i className="fa fa-trash" ></i>
                    </div>
                  </div>
                </div>
                <small className="text-muted mr-3">
                  <i className="fa fa-clock-o" ></i>&nbsp; {f.due_on}
                </small>
              </ListGroupItem>
                ;
            })
          }
        </ListGroup>
        <Modal title="Add Disposition Note" toggle={() => { this.state.dispositionCallBack() }} isOpen={this.state.showDispositionNote}>
          {DYNAMIC_DISPOSITION_FORMS ?
            <DispositionForm queue={this.state.customer.queue} onSuccess={() => { this.state.dispositionCallBack() }} customer_number={this.state.customer.contract_number} customer={{ ...this.state.customer, id: this.state.customer.costomer_id }} /> :
            <AddDispositionNote onSuccess={() => { this.state.dispositionCallBack() }} customer={{ id: this.state.customer.costomer_id, number: this.state.customer.contract_number }} />
          }
        </Modal>
      </div >
    );
  }
}

function mapStateToProps({ followups }) {
  return {
    followups
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadFollowUps,
    deleteFollowUps
  }, dispatch);
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(DefaultAside);
