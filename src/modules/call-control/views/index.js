import React, { Component } from 'react';
import { Button, FormGroup, Label, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bargein, transfer } from '../action';
import CreatableSelect from 'react-select/creatable';

class CallControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            selectedOption: '0',
            selectedAgent: ''
        };
    }

    handleOptionChange = (option) => {
        this.setState({ selectedOption: option });
        if (option !== 'Transfer') {
            this.setState({ showModal: false });
        }
    };

    handleAgentChange = (agent) => {
        this.setState({ selectedAgent: agent });
    };

    handleSubmit = () => {
        const { selectedOption, selectedAgent } = this.state;
        const { data, user } = this.props;
        if (selectedOption === "Transfer") {
            if (this.state.phone_number && this.state.phone_number.value) {
                this.props.transfer({ from: data.agent_extension, to: this.state.phone_number.value }, () => {
                    this.props.onSuccess();
                });
            } else {
                alert("Please select a number to transfer the call");
            }
        } else {
            this.props.bargein({ call_id: data.line_status.id.toString(), extension: user.user_details.extension, mode: parseInt(selectedOption) }, () => {
                this.props.onSuccess();
            })
        }
    };

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

    render() {
        const { showModal, selectedOption, selectedAgent, manualNumber } = this.state;

        const numbers = this.props.agents.map((a) => ({ label: a.AgentName, value: a.AgentExtension }));

        return (
            <div>
                {/* {JSON.stringify(this.props.data)} */}
                <FormGroup check>
                    <CustomInput
                        type="radio"
                        id="bargeInRadio"
                        name="callOption"
                        value="0"
                        checked={selectedOption === "0"}
                        onChange={() => this.handleOptionChange("0")}
                        label="Barge In"
                    />
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <CustomInput
                            type="radio"
                            id="whisperRadio"
                            name="callOption"
                            value="2"
                            checked={selectedOption === '2'}
                            onChange={() => this.handleOptionChange('2')}
                            label="Whisper"
                        />
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <CustomInput
                            type="radio"
                            id="ListenRadio"
                            name="callOption"
                            value="1"
                            checked={selectedOption === '1'}
                            onChange={() => this.handleOptionChange('1')}
                            label="Listen"
                        />
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <CustomInput
                        type="radio"
                        id="transferRadio"
                        name="callOption"
                        value="Transfer"
                        checked={selectedOption === 'Transfer'}
                        onChange={() => this.handleOptionChange('Transfer')}
                        label="Transfer"
                    />
                </FormGroup>
                {selectedOption === 'Transfer' && (
                    <FormGroup className='px-5 pt-2'>
                        <CreatableSelect
                            className="multi-select"
                            placeholder={"Select an Agent or Add a Number"}
                            isMulti={false}
                            // onCreateOption={(aa) => numbers.push({ label: aa, value: aa })}
                            value={this.state.phone_number}
                            options={numbers}
                            // getOptionValue={(option) => option["AgentExtension"]}
                            // getOptionLabel={(option) => option["AgentName"]}
                            onChange={(e) => this.setState({ phone_number: e })}
                        />
                    </FormGroup>
                )}
                {selectedOption ? <div className='px-5 py-3'><Button onClick={this.handleSubmit} color="primary">Submit</Button></div> : ""}
            </div>
        );
    }
}

function mapStateToProps({ agents, user }) {
    return {
        agents, user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        bargein,
        transfer
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CallControl);
