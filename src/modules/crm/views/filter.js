
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import 'react-dates/initialize';
import "react-datepicker/dist/react-datepicker.css";
import { getAllRecords } from '../action';
import Loader from '../../../components/Loader';
import _ from 'lodash';
import Select from 'react-select';
import FieldPicker from './components/FieldPicker';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import { CRM_FIELDS_PHONE, LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';

class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    clearForm() {
        const data = { ...this.state }
        Object.keys(data).forEach(key => {
            data[key] = "";
        });
        this.setState({ ...data });
        this.props.onFilterChange([]);
    }

    save(e) {
        // e.preventDefault();
        const { field_list, module_description } = this.props;
        const data = [];
        let query = [];

        module_description.map((field) => {
            const name = field.name;
            if (this.state[name]) {
                if (field.type.picklistValues) {
                    query.push(`${name} IN (${this.state[name].map(a => `'${a.value}'`).join()})`);
                } else if (field.type.name === "date" || field.type.name === "datetime") {
                    query.push(`${name} >= '${this.state[name].start.format("YYYY-MM-DD 00:00:00")}' AND ${name} <= '${this.state[name].end.format("YYYY-MM-DD 23:59:59")}'`);
                } else if (typeof this.state[name] === "object") {
                    if (this.state[name].value) {
                        query.push(`${name} = '${this.state[name].value}'`);
                    }
                } else if (CRM_FIELDS_PHONE.indexOf(name) > -1) {
                    query.push(`${name} LIKE '%${this.state[name].substr(-1 * LOCAL_PHONE_NUMBER_LENTGH)}%'`);
                } else {
                    query.push(`${name} LIKE '%${this.state[name]}%'`);
                }
            }
        })
        console.log(query);
        this.props.onFilterChange(query);
    }

    renderField({ name, label }) {
        const { module_description } = this.props;
        const field = _.find(module_description, { name });
        if (field) {
            return <Col key={field.name} xs={this.props.xs || "12"}>
                <FormGroup>
                    <Label>{label}</Label>
                    {
                        field.type.name === "owner" ? <FieldPicker
                            module={"Users"}
                            value={this.state[field.name]}
                            filter={true}
                            onChange={(e) => this.setState({ [field.name]: e })}
                        /> : field.type.name === "reference" ? <FieldPicker
                            module={field.type.refersTo}
                            value={this.state[field.name]}
                            filter={true}
                            onChange={(e) => this.setState({ [field.name]: e })}
                        /> : field.type.picklistValues ? <Select
                            value={this.state[field.name]}
                            options={field.type.picklistValues}
                            onChange={(e) => this.setState({ [field.name]: e })}
                            isMulti={true}
                            getOptionValue={option => option['value']}
                            getOptionLabel={option => option['label']}
                            className="multi-select"
                            isClearable={true}
                        /> : field.type.name === "date" || field.type.name === "datetime" ? <DateRangePicker
                            minimumNights={0}
                            startDate={this.state[field.name] ? this.state[field.name].start : null}
                            startDateId={`${field.name}_start`}
                            endDate={this.state[field.name] ? this.state[field.name].end : null}
                            endDateId={`${field.name}_end`}
                            onDatesChange={({ startDate, endDate }) => this.setState({ [field.name]: { start: startDate, end: endDate } })}
                            focusedInput={this.state[`focused_${field.name}`]}
                            onFocusChange={focusedInput => this.setState({ [`focused_${field.name}`]: focusedInput })}
                            orientation={this.state.orientation}
                            openDirection={this.state.openDirection}
                            disabled={false}
                            numberOfMonths={1}
                            isOutsideRange={() => false}
                        /> : <Input placeholder={`Enter the ${label}`} value={this.state[field.name]} onChange={(e) => this.setState({ [field.name]: e.target.value })} />
                    }
                </FormGroup>
            </Col>
        }
    }

    render() {
        const { module_description, field_list } = this.props;

        if (!module_description || !field_list) {
            return <Loader />;
        }

        return (
            <form>
                <Row>
                    {
                        field_list.map(({ category_name, fields }) => category_name === "default" ?
                            fields.map((field) => this.renderField(field)) :
                            <Col xs="12">
                                <h6 className='border-bottom'>{category_name}</h6>
                                <Row>
                                    {fields.map(field => this.renderField(field))}
                                </Row>
                            </Col>)
                    }
                </Row>
                <Row>
                    <Col className="text-right">
                        <Button onClick={() => this.save()} type="button" color="primary">Filter</Button>{' '}
                        <Button onClick={() => this.clearForm()} type="button" color="danger">Clear</Button>
                    </Col>
                </Row>
            </form>
        );
    }
}

function mapStateToProps({ field_list, module_description }, props) {
    return {
        field_list: field_list[props.module],
        module_description: module_description[props.module],
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAllRecords
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
