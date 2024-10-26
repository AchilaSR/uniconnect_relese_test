import React, { Component } from 'react';
import { formatDuration } from '../config/util';

class Countdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.time !== this.props.time) {
            this.setState({ time: this.props.time })
        }
    }

    componentDidMount() {
        this.setState({ time: this.props.time });


        this.timeout = setInterval(() => {
            if (this.props.time > 0) {
                this.setState({
                    time: this.state.time + 1
                });
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timeout);
    };

    render() {
        return <div>{formatDuration(this.state.time)}</div>
    }
}

export default Countdown;