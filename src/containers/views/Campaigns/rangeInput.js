import React, { Component } from "react";
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';

class RangeInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            min: "",
            max: ""
        }
    }

    onChange(val) {
        this.setState(val, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state);
            }
        });
    }

    componentDidMount() {
        if (this.props.value && this.props.value.min) {
            this.setState({ min: this.props.value.min });
        }

        if (this.props.value && this.props.value.max) {
            this.setState({ max: this.props.value.max });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.value && prevProps.value !== this.props.value) {
            if (this.props.value.min.toString()) {
                this.setState({ min: this.props.value.min.toString() });
            }

            if (this.props.value.max.toString()) {
                this.setState({ max: this.props.value.max.toString() });
            }
        }
    }

    render() {
        const { label } = this.props;
        return (<FormGroup>
            <Label htmlFor="ccnumber">{label}</Label>
            <InputGroup>
                <Input className="text-center" type="text" placeholder="Min" required value={this.state.min} onChange={(e) => this.onChange({ min: e.target.value })} />
                <Input className="text-center" type="text" placeholder="Max" required value={this.state.max} onChange={(e) => this.onChange({ max: e.target.value })} />
            </InputGroup>
        </FormGroup>);
    }
}

export default RangeInput;
