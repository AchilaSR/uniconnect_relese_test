import React, { Component } from 'react';
import { Card, CardHeader, CardBody, ListGroup } from 'reactstrap';
import User from './user';
import { getDateRange } from '../../../../utils/common.js';

class LeaderBoard extends Component {
    render() {
        const { type, data } = this.props;

        if (!data || !data.length) {
            return <div></div>;
        }

        const sortedData = data.slice().sort((a, b) => b.points - a.points);
        const highest = Math.ceil(sortedData[0].points);

        // Assign ranks
        sortedData.forEach((agent, index) => {
            agent.rank = index + 1;
        });
        console.log(sortedData)

        return (
            <Card>
                <CardHeader>
                    {`This ${type}`}
                    <div className="small text-muted">{getDateRange(type)}</div>
                </CardHeader>
                <CardBody className="p-0">
                    <ListGroup className="list-group-accent">
                        {
                            sortedData.slice(0, 5).map(a => {
                                return <User key={a.rank} data={{ ...a, points: a.points / highest * 100 }} />
                            })
                        }
                    </ListGroup>
                </CardBody>
            </Card>
        );
    }
}

export default LeaderBoard;
