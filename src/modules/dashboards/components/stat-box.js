import React, { Component } from 'react';
import { formatCurrency } from '../../../config/util';
import { CUSTOM } from '../../../custom';
import { Badge } from "reactstrap";

const sizes = {
    2: "col-sm-4 col-lg-2",
    3: "col-sm-6 col-lg-3",
    4: "col-lg-4",
    6: "col-lg-6",
    12: "col-lg-12",
}

const convertToNum = (num = "0") => {
    num = num.toString().replace(/\D/g, '');
    return parseInt(num);
}

class StatBox extends Component {

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

    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value || nextProps.sub_value !== this.props.value;
    }

    render() {
        const { value = 0, decimals = 0, size = 3, format = true, showArrow = true, inverseArrowColors = false, sub_value } = this.props;
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

        return <div className={`${sizes[size]} px-1 mb-2`}>
            <div className={`stat-box bg-${this.props.buzzer ? this.props.buzzer : "light"} rounded p-3 h-100`}>
                {showArrow ? <span className="up-down-indicator"> {this.state.change > 0 ? <i className={`fa fa-arrow-up ${upArrowColor}`} /> : this.state.change < 0 ? <i className={`fa fa-arrow-down ${downArrowColor}`} /> : ""} </span> : ""}
                <div className='d-flex align-items-center'><h4 className='mb-0'>{format ? formatCurrency(value, decimals) : value}</h4>  {sub_value ? <Badge className='ml-1'>{sub_value}</Badge> : ""}</div>
                <small className={this.props.buzzer ? "text-white" : "text-muted"}>{label || ""}</small>
            </div>
        </div>;
    }
}

export default StatBox;