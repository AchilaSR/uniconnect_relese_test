import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Table } from 'reactstrap';

class Location extends Component {
    render() {
        const { distance } = this.props;

        return (
            <Card>
                <CardHeader>Navigation Details</CardHeader>
                <CardBody>
                    <Table borderless>
                        <tbody>
                            <tr>
                                <th>From</th>
                                <td>{distance.originAddresses[0]}</td>
                            </tr>
                            <tr>
                                <th>To</th>
                                <td>{distance.destinationAddresses[0]}</td>
                            </tr>
                            <tr>
                                <th>Distance</th>
                                <td>{distance.rows[0].elements[0].distance.text}</td>
                            </tr>
                            <tr>
                                <th>Duration</th>
                                <td>{distance.rows[0].elements[0].duration.text}</td>
                            </tr>
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        );
    }
}


export default Location;
