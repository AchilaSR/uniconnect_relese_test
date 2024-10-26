import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { ListGroup, ListGroupItem, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { getAgentStatusRequestsList, loadAgentActivities, approveStatusRequest } from '../../../../actions/reports';
import { formatFriendlyDuration } from '../../../../config/util';
import { NOTIFICATION_REFRESH_INTERVAL } from '../../../../config/globals';
import Loader from '../../../../components/Loader';

class ActivityNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: ""
    }
  }

  handleEditRow({ id, agentname, subprofile }) {
    if (window.confirm(`Do you want to approve the Status of ${agentname} to ${subprofile}?`)) {
      this.props.approveStatusRequest({ id: id, status: 1 });
    }
  }

  handleDeleteRow({ id, agentname, subprofile }) {
    if (window.confirm(`Do you want to reject the Status of ${agentname} to ${subprofile}?`)) {
      this.props.approveStatusRequest({ id: id, status: -1 });
    }
  }

  componentWillMount() {
    this.props.loadAgentActivities();
    this.props.getAgentStatusRequestsList();
    this.statusIntval = setInterval(() => {
      this.props.getAgentStatusRequestsList();
    }, NOTIFICATION_REFRESH_INTERVAL * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.statusIntval);
  }

  render() {
    const { agent_status_changes, agent_activities } = this.props;

    if (!agent_status_changes) {
      return <Loader />;
    }

    const getClassByStatus = (status_name) => {
      if (status_name) {
        const status = _.find(agent_activities, (s) => {
          return s.status_3cx.toLowerCase() === status_name.toLowerCase()
        });
        if (status) {
          return `${status.color_desc}`;
        } else {
          return "white";
        }
      } else {
        return "white";
      }
    }

    // const filtered_data = agent_status_changes.filter((a) =>
    //   (a.agentname.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1 || a.agent.indexOf(this.state.search) > -1)
    // )

    const filtered_data = agent_status_changes.filter((a) => {
      const agentName = a.agentname && a.agentname.toLowerCase();
      const agent = a.agent && a.agent.toLowerCase();
      const search = this.state.search && this.state.search.toLowerCase();

      return (agentName && agentName.indexOf(search) > -1) ||
        (agent && agent.indexOf(search) > -1);
    });


    return (
      <div>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">Status Change Requests</li>
        </ol>
        <ol className="breadcrumb mb-0">
          <li style={{ width: "100%" }}>
            <InputGroup
              style={{ width: "100%" }}
              size="sm"
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText><i className="fa fa-search"></i></InputGroupText>
              </InputGroupAddon>
              <Input
                type="search"
                placeholder="Agent Name or Extension"
                value={this.state.search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />
            </InputGroup>

          </li>
        </ol>
        <ListGroup className="list-group-accent" style={{ overflow: "auto", height: "calc(100vh - 100px)" }}>
          {
            _.orderBy(filtered_data, [' break_request_time'], ['asc']).map((f) => {
              return <ListGroupItem key={f.nic} className={"list-group-item-divider " + getClassByStatus(f.profile
              )}>
                <div>
                  <div>
                    <strong>{f.agentname}</strong> requests a <strong>{f.subprofile || "Break" }</strong> {f.status_duration ? `for ${formatFriendlyDuration(f.status_duration)}` : ""}
                  </div>

                  <div className="d-flex justify-content-between">
                    <div>
                      <small className="text-muted mr-3">
                        <i className="fa fa-clock-o" ></i>&nbsp; {f.break_request_time}
                      </small>
                    </div>
                    <div>
                      <div onClick={() => this.handleEditRow(f)} className="call-button mr-1 success">
                        <i className="fa fa-check" ></i>
                      </div>
                      <div onClick={() => this.handleDeleteRow(f)} className="call-button danger">
                        <i className="fa fa-times" ></i>
                      </div>
                    </div>
                  </div>
                </div>

              </ListGroupItem>
                ;
            })
          }
        </ListGroup>
      </div>
    );
  }
}

function mapStateToProps({ agent_status_changes, agent_activities }) {
  return {
    agent_status_changes,
    agent_activities
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getAgentStatusRequestsList,
    loadAgentActivities,
    approveStatusRequest
  }, dispatch);
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(ActivityNotifications);
