import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input } from 'reactstrap';
import 'react-dates/initialize';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import { SMSReport } from '../action';
import { connect } from 'react-redux';

// import { sendReply } from '../action';

const Filter = ({ message, onSubmit, dispatch }) => {
    const [to, setTo] = useState('');
    const [from, setFrom] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
    });
    const [dateRangeState, setDateRangeState] = useState({});

    useEffect(() => {
        filter();
    }, []);

    const filter = () => {
        const filters = {};

        if (to) {
            filters.to = to.slice(-9);
        }

        if (from) {
            filters.from = from;
        }

        if (dateRange.startDate) {
            filters.startDate = dateRange.startDate;
        }

        if (dateRange.endDate) {
            filters.endDate = dateRange.endDate;
        }

        onSubmit(filters);
    };


    return (
        <form onSubmit={(e) => { e.preventDefault(); filter() }}>
            <Row>
                <Col>

                    <FormGroup>
                        <Label htmlFor="ccnumber">Duration</Label>
                        <DateRangePicker
                            minimumNights={0}
                            startDate={dateRange.startDate}
                            startDateId="cs_startDate"
                            endDate={dateRange.endDate}
                            endDateId="cs_endDate"
                            onDatesChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
                            focusedInput={dateRangeState.cs_focusedInput}
                            onFocusChange={cs_focusedInput => setDateRangeState({ ...dateRangeState, cs_focusedInput })}
                            orientation={dateRangeState.orientation}
                            openDirection={dateRangeState.openDirection}
                            disabled={false}
                            isOutsideRange={() => false}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs="12">
                    <FormGroup>
                        <Label htmlFor="name">From</Label>
                        <Input
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs="12">
                    <FormGroup>
                        <Label htmlFor="name">To</Label>
                        <Input
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="text-right">
                    <Button type="submit" color="primary">Filter</Button>
                </Col>
            </Row>
        </form>
    );
}

export default connect()(Filter);