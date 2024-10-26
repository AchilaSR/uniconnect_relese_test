import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, FormText} from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create, getCliList } from '../action';
import Select from 'react-select';
class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cli: "",
            prefix: "",
            clis: []
        };
    }

    componentWillMount() {
        this.props.getCliList();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            const { data } = this.props;
            this.setState(data);
        }
    }

    save(e) {
        e.preventDefault();
        this.props.create({
            cli: this.state.cli,
            prefix: this.state.prefix,
            cli_list: _.map(this.state.clis, item => parseInt(item.value, 10)),
        }, (err) => {
            if (!err) {
                this.clearForm();
            }
        });
        return false;
    }

    clearForm() {
        this.setState({
            cli: "",
            prefix: "",
            clis: []
        }, this.props.onCancel());
    }

    render() {
        const { cli_list } = this.props
        const options = cli_list ? cli_list.map(cli => ({ value: cli, label: cli })) : [];
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">CLI Name</Label>
                                <Input type="text" placeholder="Enter the Outbound CLI" value={this.state.cli} onChange={(e) => this.setState({ cli: e.target.value })} required />
                                {this.state.error_name ? <FormText color="danger">{this.state.error_name}</FormText> : ''}
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Prefix</Label>
                                <Input type="text" placeholder="Enter the Prefix" value={this.state.prefix} onChange={(e) => this.setState({ prefix: e.target.value })} required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">CLI List</Label>
                                <Select
                                    value={this.state.clis}
                                    options={options}
                                    onChange={(e) => this.setState({ clis: e })}
                                    isMulti
                                    className="multi-select"
                                    isClearable
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-right">
                            <Button type="submit" color="primary">Save</Button>{' '}
                            <Button onClick={() => this.clearForm()} color="danger">Cancel</Button>
                        </Col>
                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapStateToProps({ cli_list }) {
    return {
        cli_list
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create,
        getCliList
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Create));