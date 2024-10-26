import React, { Component } from 'react';
import { formatCurrency } from '../../../config/util';

const convertToNum = (num = "0") => {
    num = num.toString().replace(/\D/g, '');
    return parseInt(num);
}

class StatCell extends Component {

    constructor(props) {
        super(props);
        this.state = {
            change: 0,
            updatedTime: Date.now()
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value || this.state.updatedTime < Date.now() - 15000) {
            this.setState({ change: convertToNum(this.props.value) - convertToNum(prevProps.value), updatedTime: Date.now() })
        }
    }

    render() {
        const { value = 0, decimals = 0, format = true, inverseArrowColors = false } = this.props;

        let upArrowColor = "text-success";
        let downArrowColor = "text-danger";

        if (inverseArrowColors) {
            downArrowColor = "text-success";
            upArrowColor = "text-danger";
        }

        return <td className="text-right">
            <div className="d-flex  justify-content-between">
                {this.state.change > 0 ? <i className={`fa fa-arrow-up ${upArrowColor}`} /> : this.state.change < 0 ? <i className={`fa fa-arrow-down ${downArrowColor}`} /> : <span />}
                {format ? formatCurrency(value, decimals) : value}
            </div>
        </td>
    }
}

export default StatCell;