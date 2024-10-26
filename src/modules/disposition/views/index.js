import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge } from 'reactstrap';
import Create from './create';
import Filter from './filter';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listCategories } from '../action';
import { checkPermission, formatDispostionToString, formatTimeToSeconds, getReportData } from '../../../config/util'
import { index as listTemplates } from '../../disposition-note-templates/action';
import { callDirect } from '../../../actions/facilities';
import queryString from 'querystringify';
import { CSVLink } from 'react-csv';
import Loader from '../../../components/Loader';
import { DISPOSITION_NOTE_DISPOSITION_DATA, DYNAMIC_DISPOSITION_FORMS } from '../../../config/globals';
import DispositionForm from '../../disposition-forms/views/send';
import { changeOutboundMode } from '../../../actions';
import DispositionTable from './table';
import moment from 'moment';
import { listQueues } from '../../../actions/configurations';

class Groups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false,
            customer_number: "",
            editmode: false,
            hideTable: true,
            elapsed_time: 0,
            updatedTime: 0
        };
    }

    componentWillMount() {
        const { number } = queryString.parse(this.props.location.search);
        if (number) {
            this.setState({ customer_number: number, editmode: true, hideTable: true });
        }
        this.props.listCategories();
        this.props.listTemplates();

        this.setState({ hasReadAccess: checkPermission('Disposition Management', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Disposition Management', 'WRITE') });
    }

    componentDidMount() {
        this.props.changeOutboundMode("0");
        this.props.listQueues();
        this.init({});
    }

    componentDidUpdate(prevProps) {
        this.init(prevProps);
    }

    init(prevProps) {
        if (this.props.phone_status && this.props.phone_status.status === "aftercall") {
            if (prevProps.phone_status) {
                if (prevProps.phone_status.status !== "aftercall" || !this.state.editmode) {
                    this.setState({
                        customer_number: this.props.phone_status.customer_number,
                        editmode: true,
                        elapsed_time: this.props.phone_status.elapsed_time,
                        last_call_queue: this.props.phone_status.last_call_queue
                    })
                }
            } else {
                this.setState({
                    customer_number: this.props.phone_status.customer_number,
                    editmode: true,
                    elapsed_time: this.props.phone_status.elapsed_time
                });
            }
        } else if (this.props.phone_status !== prevProps.phone_status) {
            this.setState({
                customer_number: "",
                editmode: false,
                hideTable: false
            });
        }
    }

    handleEditRow(selected_note) {
        this.setState({ selected_note, editmode: true })
    }

    // getColor(status) {
    //     return PHONE_STATUS_COLORS[status] || PHONE_STATUS_COLORS.loading
    // }

    call(e) {
        e.preventDefault();
        this.setState({ dialing: true });
        const self = this;
        this.props.callDirect({
            "customer_id": null,
            "number": this.state.number
        }, () => {
            self.setState({ number: "" })

            this.dialingStateTimer = setInterval(() => {
                self.setState({ dialing: false });
            }, 5 * 1000);
        });
    }

    componentWillUnmount() {
        clearInterval(this.dialingStateTimer);
        // this.props.changeOutboundMode("1");
    }


    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false;
        }
    }


    render() {
        let data, filteredData;

        let headers = [
            {
                "key": "id",
                "label": "Id"
            },
            {
                "key": "start_time",
                "label": "Start Time"
            },
            {
                "key": "updated_time",
                "label": "End Time"
            },
            {
                "key": "customer_number",
                "label": "Customer Number"
            },
            {
                "key": "agent_name",
                "label": "Agent Name"
            },
            {
                "key": "agent_extension",
                "label": "Agent Extension"
            },
            {
                "key": "comments",
                "label": "Comments"
            },
            {
                "key": "handling_time",
                "label": "Handling Time"
            },
            {
                "key": "exceeded_time",
                "label": "Exceeded Time"
            },
            {
                "key": "direction",
                "label": "Direction"
            },
            {
                "key": "Call Connectivity",
                "label": "Call Connectivity"
            },
            {
                "key": "Reason",
                "label": "Reason"
            },
            {
                "key": "Followup Date",
                "label": "Followup Date"
            }
        ];

        if (DYNAMIC_DISPOSITION_FORMS) {
            if (this.state.disposition_notes && this.state.disposition_notes.length > 0) {
                const report_data = getReportData(this.state.disposition_notes.map((a) => {
                    try {
                        const dis = JSON.parse(a.disposition_data);
                        if(!DISPOSITION_NOTE_DISPOSITION_DATA){
                            const dis_data = dis.disposition || dis.data;
                            if (dis_data) {
                                const d = {}
                                dis_data.forEach(([key, value]) => d[key] = value);
                                a = { ...a, ...d };
                            } else {
                                a = { ...a, ...dis };
                            }
                            delete a.disposition_data;
                        }
                        
                    } catch (error) {

                    }
                    return a;
                }));

                data = report_data.data;
                headers = report_data.headers;

                filteredData = data.map((item, index) => ({
                    ...item,
                    // start_time: item.start_time,
                    disposition_data: item.disposition_data ? formatDispostionToString(item.disposition_data) : ""
                }))
            }
        } else {
            const report_data = getReportData(this.state.disposition_notes);
            data = report_data.data;
            headers = report_data.headers;

            if (headers) {
                let newHeaders = [
                    { key: 'comments', label: 'Comments' },
                    { key: 'category', label: 'Category' },
                    { key: 'disposition_code', label: 'Disposition Code' },
                    { key: 'disposition_class', label: 'Disposition Class' },
                    { key: 'disposition_type', label: 'Disposition Type' },
                    { key: 'call_type', label: 'Call Type' }
                ];

                headers = headers.concat(newHeaders);
            }

            if (data) {
                filteredData = data.map((item, index) => ({
                    ...item,
                    // start_time: item.start_time.format("YYYY-MM-DD HH:mm:ss"),
                    // disposition_data: item.disposition_data ? this.dialogCSVDisposition(item.disposition_data) : "",
                    handling_time: item.handling_time ? formatTimeToSeconds(item.handling_time) : "",
                    comments: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).comments : item.disposition_data,
                    category: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).category : "",
                    disposition_code: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).disposition_code : "",
                    disposition_class: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).disposition_class : "",
                    disposition_type: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).disposition_type : "",
                    call_type: item.disposition_data && this.isValidJSON(item.disposition_data) ? JSON.parse(item.disposition_data).call_type : "",
                }))

                for (let i = 0; i < filteredData.length; i++) {
                    // Remove the object from the array
                    delete filteredData[i].disposition_data;
                    delete filteredData[i].start_time;
                    delete filteredData[i].end_time;

                    if (filteredData[i].handling_time == "") {
                        filteredData[i].handling_time = 0
                    }
                }
                // console.log(filteredData)
                // Keys to remove
                let keysToRemove = ["start_time", "end_time", "disposition_data"];

                headers = headers.filter(obj => !keysToRemove.includes(obj.key));
            }


        }

        if (!this.state.editmode && this.state.hideTable) {
            return <Loader />
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Disposition Notes</li>
                    <li className="breadcrumb-menu">
                        {/* {this.props.phone_status ?
                            <Badge color={this.getColor(this.props.phone_status.status).color} className='text-uppercase px-3'>
                                {`${this.props.phone_status.customer_number} ${this.props.phone_status.customer_number ? "-" : ""} ${this.getColor(this.props.phone_status.status).label}`}
                            </Badge> : ""} */}
                        <div className="btn-group">
                            {data ?
                                <CSVLink data={filteredData} headers={headers} filename={"disposition_notes.csv"} ><a className="btn"><i className="fa fa-download"></i> Download CSV</a></CSVLink>
                                : ""}
                            {this.state.hideTable ?
                                <button onClick={() => this.setState({ editmode: false, hideTable: false })} className="btn"><i className="fa fa-plus"></i> Show Notes</button> :
                                this.state.hasReadAccess && this.props.phone_status && this.props.phone_status.status === "aftercall" ?
                                    <button onClick={() => this.setState({ selected_note: null, editmode: true })} className="btn"><i className="fa fa-plus"></i> Add Note</button> : ""
                            }
                        </div>
                    </li>
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        {!this.state.editmode && !this.state.hideTable ? <div className="mr-3">
                            <Card style={{ flexShrink: 0, width: 300 }} className='mb-3'>
                                <CardBody>
                                    {DYNAMIC_DISPOSITION_FORMS || this.props.user.user_details.outboundservice.id ? <form onSubmit={(e) => { this.call(e) }} >
                                        <div className="d-flex justify-content-between">
                                            <Input type="text" id="name" placeholder={`Enter a Phone Number`} required value={this.state.number} onChange={(e) => this.setState({ number: e.target.value })} />
                                            <Button disabled={this.state.dialing} type='submit' className="ml-3" style={{ width: 100 }} color="success">Call</Button>
                                        </div>
                                    </form> : <p className='mb-0'>Please select a <b>Service</b> in <b>Profile Settings</b> to enable outbound dialing</p>}
                                </CardBody>
                            </Card>
                            <Filter onFiltered={(data) => this.setState({ disposition_notes: data })} /></div>
                            : null}
                        {!this.state.hideTable && !this.state.editmode ?
                            <Card className="flex-grow-1">
                                <CardHeader>Disposition Notes</CardHeader>
                                <CardBody>
                                    <DispositionTable data={this.state.disposition_notes} onEdit={(row) => this.handleEditRow(row)} editable={this.state.hasReadAccess} />
                                </CardBody>
                            </Card> : ""}
                        {this.state.hasWriteAccess && this.state.editmode && this.state.updatedTime < Date.now() - 5000 ? <div className="mx-auto" style={{ width: 500 }}>
                            <Card>
                                <CardHeader>New Note</CardHeader>
                                <CardBody>
                                    {DYNAMIC_DISPOSITION_FORMS ?
                                        <DispositionForm inbound={true} queue={this.state.last_call_queue} onSuccess={() => this.setState({ selected_note: null, editmode: false, hideTable: false, updatedTime: Date.now() })} elapsed_time={this.state.elapsed_time} customer_number={this.state.customer_number} /> :
                                        <Create queue={this.props.phone_status && this.props.phone_status.direction === "inbound" ? this.props.phone_status.last_call_queue : this.props.user.user_details.outboundservice ? this.props.user.user_details.outboundservice.queue || this.props.user.user_details.outboundservice.service_name : undefined} onClose={() => this.setState({ selected_note: null, editmode: false, hideTable: false, updatedTime: Date.now() })} note={this.state.selected_note} elapsed_time={this.state.elapsed_time} customer_number={this.state.customer_number} />}
                                </CardBody>
                            </Card>
                        </div> : null}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ disposition_notes, phone_status, user }) {
    return {
        disposition_notes,
        phone_status,
        user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listCategories,
        listTemplates,
        callDirect,
        listQueues,
        changeOutboundMode
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Groups));