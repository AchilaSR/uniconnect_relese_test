import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Button, Input, CustomInput, Alert, Table } from 'reactstrap';
import _, { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import { loadCampaigns } from '../../../actions/campaigns';
import { loadFacilities, deleteFacility } from '../../../actions/facilities';
import { DYNAMIC_DISPOSITION_FORMS, LEAD_STATUS, LOCAL_PHONE_NUMBER_LENTGH } from '../../../config/globals';
import moment from "moment";
import DateTimeRangePicker from "../../../components/DateTimeRangePicker";
import { DateRangePicker } from 'react-dates';

class LeadsFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            campaign: null,
            disposition: null,
            phone: null,
            status: [],
            filtered_logs: [],
            filterData: [],
            duration_start: moment(),
            duration_end: moment(),
            addedon_min: null,
            addedon_max: null,
        };
    }

    componentDidMount() {
        this.props.loadCampaigns();

        if (this.props.filters && this.props.filters.campaign) {
            if (!isEmpty(this.props.filters.campaign)) {
                this.setState({ campaign: this.props.filters.campaign });
            }

        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {

        }
    }

    changeStatus(key) {
        const i = this.state.status.indexOf(parseInt(key));
        if (i > -1) {
            const status = this.state.status;
            status.splice(i, 1);
            this.setState({ status });
        } else {
            this.setState({ status: [parseInt(key), ...this.state.status] });
        }
    }

    filterReport() {

        if(!this.state.campaign){
            alert("Please select a Campaign")
            return
        }

        let startDate = this.state.addedon_min ? this.state.addedon_min.format("YYYY-MM-DD 00:00:00") : null;
        let endDate = this.state.addedon_max ? this.state.addedon_max.format("YYYY-MM-DD 00:00:00") : null;

        if (this.state.addedon_min) {
            if (!this.state.addedon_max) {
                endDate = moment().format("YYYY-MM-DD 23:59:59");
            } else {
                endDate = this.state.addedon_max.format("YYYY-MM-DD 23:59:59");
            }
        }


        if (this.state.addedon_max) {
            if (!this.state.addedon_min) {
                startDate = "2000-01-01 23:59:59";
            } else {
                startDate = this.state.addedon_min.format("YYYY-MM-DD 00:00:00");
            }
        }


        let data = {
            "campaign_id": this.state.campaign ? this.state.campaign.campign_id : null,
            "limit": this.props.isCampaignLead ? 100000 : 10,
            "offset": this.props.isCampaignLead ? 0 : 0,
            "phone": this.state.phone ? this.state.phone.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH) : null,
            "disposition": this.state.disposition,
            "status": this.state.status,
            "lead_status": this.state.lead_status ? this.state.lead_status.key : null,
            "startDate": startDate,
            "endDate": endDate
        }

        this.setState({ loading: true });
        let fileds = {
            campaign: this.state.campaign,
            disposition: this.state.disposition,
            phone: this.state.phone,
            status: this.state.status,
            lead_status: this.state.lead_status ? this.state.lead_status.key : null
        }

        this.props.loadFacilities(data, (err, data) => {
            this.setState({ filterData: data, loading: false }, () => {
                this.props.onFiltered(this.state.filterData, fileds);
            })
        });
    }

    render() {

        const { data, leadstatus, campaigns, isCampaignLead } = this.props;

        return (
            <Card className="mr-3" style={{ flexShrink: 0, width: 300 }}>
                <CardHeader>Filter</CardHeader>
                <CardBody className="scrollable-card">
                    {/* <Row>
                        <Col>
                            {
                                <Alert color="info"><b>{this.state.filtered_logs.length}</b> records out of <b>{data.length}</b> filtered</Alert>
                            }
                        </Col>
                    </Row> */}
                    {!isCampaignLead &&
                        <Row>
                            <Col xs="12">
                                <FormGroup>
                                    <Label htmlFor="name">Campaign</Label>
                                    {/* <Input value={this.state.campaign} onChange={(e) => this.setState({ campaign: e.target.value })} /> */}
                                    <Select
                                        name="form-field-name2"
                                        value={this.state.campaign || null}
                                        options={campaigns}
                                        onChange={(e) => this.setState({ campaign: e })}
                                        isMulti={false}
                                        isClearable={true}
                                        getOptionValue={option => option['campign_id']}
                                        getOptionLabel={option => option['campaign_name']}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>}

                    {
                        LEAD_STATUS ? <Row>
                            <Col xs="12">
                                <FormGroup>
                                    <Label htmlFor="name">Lead Status</Label>
                                    {/* <Input value={this.state.campaign} onChange={(e) => this.setState({ campaign: e.target.value })} /> */}
                                    <Select
                                        name="form-field-name2"
                                        value={this.state.lead_status}
                                        options={LEAD_STATUS.map((a) => ({ label: a, key: a }))}
                                        onChange={(e) => this.setState({ lead_status: e })}
                                        isMulti={false}
                                        isClearable={true}
                                    />
                                </FormGroup>
                            </Col>
                        </Row> : ""
                    }
                    {DYNAMIC_DISPOSITION_FORMS ?
                        "" :
                        <Row>
                            <Col xs="12">
                                <FormGroup>
                                    <Label htmlFor="name">Disposition</Label>
                                    <Input value={this.state.disposition} onChange={(e) => this.setState({ disposition: e.target.value })} />
                                </FormGroup>
                            </Col>
                        </Row>
                    }
                    {/* <Row>
                        <Col >
                            <DateTimeRangePicker
                                startDate={this.state.duration_start}
                                endDate={this.state.duration_end}
                                onDatesChange={({ startDate, endDate }) =>
                                    this.setState({
                                        duration_start: startDate,
                                        duration_end: endDate,
                                    })
                                }
                            />
                        </Col>
                    </Row> */}

                    {isCampaignLead && <>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label htmlFor="ccnumber">Uploaded Date</Label>
                                    <DateRangePicker
                                        startDate={this.state.addedon_min}
                                        minimumNights={0}
                                        startDateId="dd_startDate"
                                        endDate={this.state.addedon_max}
                                        endDateId="dd_endDate"
                                        onDatesChange={({ startDate, endDate }) =>
                                            this.setState({
                                                addedon_min: startDate,
                                                addedon_max: endDate,
                                            })
                                        }
                                        focusedInput={this.state.dd_focusedInput}
                                        onFocusChange={(dd_focusedInput) =>
                                            this.setState({ dd_focusedInput })
                                        }
                                        orientation={this.state.orientation}
                                        openDirection={this.state.openDirection}
                                        disabled={false}
                                        isOutsideRange={() => false}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </>}

                    <Row>
                        <Col xs="12">
                            <FormGroup>
                                <Label htmlFor="name">Phone Number</Label>
                                <Input value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value })} />
                            </FormGroup>
                        </Col>
                    </Row>




                    {!isCampaignLead ? <Row>
                        <Col>
                            <FormGroup>
                                <Label for="exampleCheckbox">Status</Label>
                                <div>
                                    {
                                        leadstatus.map((a) => <CustomInput
                                            id={a.statuscode}
                                            key={a.statuscode}
                                            onChange={() => this.changeStatus(a.statuscode)}
                                            checked={this.state.status.indexOf(a.statuscode) > -1}
                                            type="checkbox" label={a.statusname} />)
                                    }
                                </div>
                            </FormGroup>
                        </Col>
                    </Row> :

                        <Row>
                            <Col>
                                <Label for="exampleCheckbox">Status</Label>
                                <Table borderless size='sm' striped={true}>
                                    <tbody>
                                        {
                                            leadstatus.map((s) => {
                                                return (
                                                    <tr key={s.colorcode} className="legend pb-2">
                                                        <td className={`bg-${s.colorcode}`}>&nbsp; </td>
                                                        <td className="pl-2 d-flex align-items-center">

                                                            <CustomInput
                                                                id={s.statuscode}
                                                                key={s.statuscode}
                                                                onChange={() => this.changeStatus(s.statuscode)}
                                                                checked={this.state.status.indexOf(s.statuscode) > -1}
                                                                type="checkbox"
                                                                className="ml-2"
                                                            />
                                                            {s.statusdescription}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>}
                    <Row>
                        <Col className="text-right">
                            <Button disabled={this.state.loading} onClick={() => { this.filterReport() }} color="primary">Filter</Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
}

function mapStateToProps({ campaigns, facilities }) {
    return {
        campaigns,
        facilities
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadCampaigns,
        loadFacilities
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(LeadsFilter));