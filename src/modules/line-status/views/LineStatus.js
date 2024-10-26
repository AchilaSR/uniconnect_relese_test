import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PHONE_STATUS_COLORS, PHONE_STATUS_REFRESH } from '../../../config/globals';
import { getLineStatus } from '../action';

class LineStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone_status: {}
        };
    }

    componentDidMount() {
        const self = this;
        self.props.getLineStatus(this.props.extension, (err, data) => {
            self.setState({ phone_status: data });
        });
        this.interval = setInterval(() => {
            self.props.getLineStatus(self.props.extension, (err, data) => {
                self.setState({ phone_status: data });
            });
        }, PHONE_STATUS_REFRESH * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getColor(status) {
        return PHONE_STATUS_COLORS[status] || PHONE_STATUS_COLORS.loading
    };

    render() {
        if (!this.state.phone_status) {
            return <div></div>
        }

        return (
            <Badge color={this.getColor(this.state.phone_status.status).color} className='text-uppercase px-3'>
                {this.state.phone_status.direction === "inbound" || this.state.phone_status.status === "ringing" ? "[IN]" : this.state.phone_status.direction === "outbound" || this.state.phone_status.status === "dialing" ? "[OUT]" : ""} {this.getColor(this.state.phone_status.status).label} {this.state.phone_status.customer_number ? <div>{this.state.phone_status.customer_number}</div> : ""}
            </Badge>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getLineStatus
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(LineStatus));
