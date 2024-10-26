import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import Loader from '../../../../components/Loader';

class StatusDropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            sizePerPage: 10,
            page: 1
        };
    }

    toggle() {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    render() {
        const { agent_activities } = this.props;

        if (!agent_activities) {
            return <Loader />
        }

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
                {/* <DropdownToggle size="sm" outline color="primary" caret> */}
                <DropdownToggle size="sm" outline color="primary" >
                    {/* Change Status */}
                    <i className="fa fa-pencil" ></i>
                </DropdownToggle>
                <DropdownMenu right>
                    {
                        agent_activities.map((status) => {
                            if (!(status.id === 1 || status.id === 2)) {
                                return <DropdownItem onClick={() => { this.props.onClick(status) }} className={`bg-${status.color_desc}`}>{status.status_name.toLowerCase()}</DropdownItem>
                            } else {
                                return null;
                            }
                        })
                    }
                </DropdownMenu>
            </Dropdown>
        );
    }
}


function mapStateToProps({ agent_activities }) {
    return {
        agent_activities
    };
}

export default (connect(mapStateToProps, null)(StatusDropdown));