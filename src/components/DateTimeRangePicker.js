import React, { useEffect, useState } from 'react';
import { Col, Row, FormGroup, Label } from 'reactstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

let DateTimeRangePicker = ({ onDatesChange, startDate, endDate, disabled, min, max = new Date() }) => {
    const [starttime, setStartTime] = useState(moment(startDate).startOf("date").toDate());
    const [endtime, setEndTime] = useState(moment(endDate).endOf("date").toDate());

    useEffect(() => {
        onDatesChange({ startDate: moment(starttime), endDate: moment(endtime) });
    }, [starttime, endtime]);

    return <div>
        <Row>
            <Col>
                <FormGroup>
                    <Label htmlFor="ccnumber">Start Date and Time</Label>
                    <DatePicker
                        selected={starttime}
                        onChange={(starttime) => {
                            setStartTime(starttime);
                            setEndTime(moment(starttime).diff(endtime) > 0 ? starttime : endtime);
                        }}
                        showTimeSelect
                        minDate={min}
                        maxDate={max}
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        className="form-control"
                        disabled={disabled}
                    />
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col>
                <FormGroup>
                    <Label htmlFor="ccnumber">End Date and Time</Label>
                    <DatePicker
                        selected={endtime}
                        onChange={(endtime) => {
                            setEndTime(endtime);
                            setStartTime(moment(starttime).diff(endtime) > 0 ? endtime : starttime);
                        }}
                        showTimeSelect
                        minDate={starttime}
                        maxDate={max}
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        className="form-control"
                        disabled={disabled}
                    />
                </FormGroup>
            </Col>
        </Row>
    </div>;
}


export default DateTimeRangePicker;