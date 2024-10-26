import React, { Component } from 'react';
import { Row } from 'reactstrap';
import StatBox from '../../../dashboards/components/stat-box';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCounts } from '../../action';

class CountWidget extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = {};
    }

    componentWillMount() {
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    loadData() {

        const { module_name, search_fileds, sortField, values } = this.props;
        this.props.getCounts({ module_name, query: search_fileds.join(" AND "), groupBy: sortField, values }, (err, data) => {
            this.setState({ data });
        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        if (!this.state.data) {
            return <div>No data available</div>
        }

        let size = 12 / this.state.data.length;

        if (size < 2) {
            size = 2 / size * size;
        }

        if (this.props.position.w && this.props.position.w === 1) {
            size = 12
        }

        size = Math.floor(size);

        return <div>
            <Row className="px-3">
                {
                    this.state.data.map((a) => <StatBox key={a.value} size={size} value={a.count} label={a.value} />)
                }
            </Row>
        </div>;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getCounts
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(CountWidget));