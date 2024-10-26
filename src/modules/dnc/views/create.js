import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { create } from '../action';
import Loader from '../../../components/Loader';
import CreatableSelect from 'react-select/creatable';
import { formatPhone } from '../../../config/util';

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upload_type: "manual",
            numbers: [],
            tmp_numbers: [],
            number: "",
            file: ""
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleKeyDown(e) {
        if (!this.state.number)
            return;
        switch (e.key) {
            case 'Enter':
            case 'Tab':
                const n = formatPhone(this.state.number);
                if (n) {
                    this.setState({ number: "", tmp_numbers: [...(this.state.tmp_numbers || []), { value: n, label: n }], numbers: [...(this.state.numbers || []), n] });
                    e.preventDefault();
                } else {
                    alert("Invalid Number")
                }
                return;
        }
    }

    handleFileChange(e) {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = (e.target.result);
            const nums = text.split(/\r\n|\n\r|\n|\r/);
            const valid = [];
            for (let i = 0; i < nums.length; i++) {
                const n = formatPhone(nums[i]);
                if (n) {
                    valid.push(n);
                }
            }

            if (valid.length) {
                this.setState({ numbers: valid });
            } else {
                alert("No valid numbers found");
            }
        };
        reader.readAsText(e.target.files[0]);
    };

    save(e) {
        e.preventDefault();
        const self = this;
        this.props.create(this.state.numbers, (err) => {
            if (!err) {
                self.setState({
                    upload_type: "manual",
                    numbers: [],
                    tmp_numbers: [],
                    number: "",
                    file: ""
                });
            }
        });
        return false;
    }

    render() {
        return (
            <CardBody>
                <form onSubmit={(e) => this.save(e)}>
                    <FormGroup check>
                        <Label check><Input type="radio" name="uploadType" value={"manual"} checked={this.state.upload_type === "manual"} onChange={e => this.setState({ upload_type: e.currentTarget.value, numbers: [], tmp_numbers: [] })} /> Manually add numbers</Label>
                    </FormGroup>
                    <FormGroup check>
                        <Label check><Input type="radio" name="uploadType" value={"file"} checked={this.state.upload_type === "file"} onChange={e => this.setState({ upload_type: e.currentTarget.value, numbers: [], tmp_numbers: [] })} /> Upload file</Label>
                    </FormGroup>
                    <hr />
                    {this.state.upload_type === "manual" ?
                        <FormGroup>
                            <CreatableSelect
                                inputValue={this.state.number}
                                components={{
                                    DropdownIndicator: null,
                                }}
                                value={this.state.tmp_numbers}
                                onChange={(e) => this.setState({ tmp_numbers: e })}
                                onInputChange={(e) => this.setState({ number: e })}
                                isMulti={true}
                                onKeyDown={this.handleKeyDown}
                                className="multi-select"
                                placeholder={"Add numbers and press enter"}
                                menuIsOpen={false}
                            />
                        </FormGroup> :
                        <FormGroup>
                            <Input type="file" accept=".csv, .txt" onChange={this.handleFileChange} />
                        </FormGroup>}
                    {this.state.numbers && this.state.numbers.length ? <Alert color='info'>{this.state.numbers.length} numbers found</Alert> : ""}
                    <Row>
                        <Col className="text-right">
                            <Button disabled={!this.state.numbers || !this.state.numbers.length} type="submit" color="primary">Upload</Button>{' '}
                        </Col>
                    </Row>
                </form>
            </CardBody>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        create
    }, dispatch);
}

export default (connect(null, mapDispatchToProps)(Create));