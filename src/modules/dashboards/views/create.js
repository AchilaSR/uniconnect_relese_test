import React, { Component } from "react";
import { connect } from "react-redux";
import { CRM_PERMISSIONS } from "../../crm/config";
import { Nav, TabContent, TabPane, NavItem, NavLink, Badge } from "reactstrap";
import CreateCallStats from "./create-call-stats";
import CreateCrmStats from "../../crm/views/widgets/create-crm-stats";
import { checkPermission } from "../../../config/util";
import classnames from "classnames";

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableCrmWidgets: false,
      enableCallWidgets: true,
      activeTab: "Call Stats"
    };
  }

  componentDidMount() {
    this.setState({ enableCrmWidgets: Object.values(CRM_PERMISSIONS).some((perm) => checkPermission(perm)) });
  }


  render() {
    return (
      <div>
        {this.state.enableCrmWidgets ? <Nav tabs>
          {["Call Stats", "CRM Stats"].map(a => (<NavItem key={a}>
            <NavLink
              className={classnames({ active: this.state.activeTab === a })}
              onClick={() => { this.setState({ activeTab: a }) }}>
              {a} {a === "CRM Stats" ? <Badge color="info">Beta</Badge> : ""}
            </NavLink>
          </NavItem>))}
        </Nav> : ""}
        <TabContent activeTab={this.state.activeTab} >
          <TabPane tabId="Call Stats">
            <CreateCallStats  {...this.props} />
          </TabPane>
          <TabPane tabId="CRM Stats">
            <CreateCrmStats {...this.props} />
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

function mapStateToProps({ }) {
  return {

  };
}

export default connect(mapStateToProps, null)(Create);
