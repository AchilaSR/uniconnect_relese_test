import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from 'reactstrap';
import { loadTemplate, reSyncCampaign } from '../../../actions/campaigns';

class RefreshButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            disabled: false
        }
    }

    refresh(campaign_name) {
        const self = this;
        if (window.confirm("Are you sure, you want to re-sync the campaign?")) {
            this.setState({ loading: true });
            this.props.loadTemplate(campaign_name, (data) => {
                this.props.reSyncCampaign(data, function () {
                    self.setState({ loading: false });
                    if (typeof self.props.onComplete === "function") {
                        self.props.onComplete();
                    }
                });
            });
        }
    }

    render() {
        const { template, disabled } = this.props;
        return (<Button size="sm" disabled={this.state.loading || disabled} outline onClick={() => this.refresh(template)} color="primary"><i className={`fa fa-refresh ${this.state.loading ? 'fa-spin' : ''}`} ></i></Button>);
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadTemplate, reSyncCampaign
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(RefreshButton);
