import React, { Component } from 'react';
import { formatCurrency } from '../../../config/util';
import { CUSTOM } from '../../../custom';

const convertToNum = (num = "0") => {
    num = num.toString().replace(/\D/g, '');
    return parseInt(num);
}

class StatBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            change: 0
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            // this.setState({ change: convertToNum(this.props.value) - convertToNum(prevProps.value) })
        }
    }

    render() {
        const { value = 0, decimals = 0, size = 3, format = true, showArrow = true, inverseArrowColors = false } = this.props;
        let { label } = this.props;

        let upArrowColor = "text-success";
        let downArrowColor = "text-danger";

        if (inverseArrowColors) {
            downArrowColor = "text-success";
            upArrowColor = "text-danger";
        }

        if (CUSTOM.LABELS && CUSTOM.LABELS[label]) {
            label = CUSTOM.LABELS[label];
        }

        return <div style={{ minWidth: 90 }} className={`stat-box rounded px-2 py-1`}>
            <small className="text-muted">{label || ""}</small>
            <div className='d-flex justify-content-between'> {showArrow ? <span className="up-down-indicator"> {this.state.change > 0 ? <i className={`fa fa-arrow-up ${upArrowColor}`} /> : this.state.change < 0 ? <i className={`fa fa-arrow-down ${downArrowColor}`} /> : ""} </span> : ""}<b>{format ? formatCurrency(value, decimals) : value}</b></div>
        </div>;
    }
}

export default StatBox;