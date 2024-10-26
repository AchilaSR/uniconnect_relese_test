import React, { Component } from 'react';
import { CardBody, Row, Col, FormGroup, Input } from 'reactstrap';
import Loader from '../../../components/Loader';

class Search extends Component {
    constructor(props) {
        super(props);
    }

    onSearchChange(e) {
        this.props.onSearch(e.target.value);
    }

    render() {
        return (
            <CardBody>
                <Row>
                    <Col xs="12">
                        <FormGroup>
                            <Input type="text" placeholder="Search Number in DNC list" value={this.props.search} onChange={(e) => this.onSearchChange(e)} required />
                        </FormGroup>
                    </Col>
                </Row>
            </CardBody>
        );
    }
}


export default Search;