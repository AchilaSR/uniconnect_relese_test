import React, { Component } from 'react';
import { Button } from 'reactstrap';

class CheckBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selected || ""
        };
    }

    componentDidUpdate() {
        if (this.state.selected !== this.props.selected) {
            this.setState({ selected: this.props.selected });
        }
    }

    change() {
        const self = this;
        this.setState({ selected: !this.state.selected }, () => {
            self.props.onChange(self.state.selected);
        })
    }

    render() {
        return (

            <Button onClick={() => this.change()} className={`checkbox ${this.state.selected ? "btn-success" : ""}`}  outline={!this.state.selected} color={this.state.selected ? "success" : "primary"} >
                {this.state.selected ? <i className="fa fa-check"></i> : <i className="fa fa-times"></i>}
            </Button>

        );
    }
}

export default CheckBox;