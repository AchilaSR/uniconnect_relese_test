
import React, { Component } from 'react';
import { Row, Col, Button, FormGroup, Input, Alert } from 'reactstrap';
import 'react-dates/initialize';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { send } from '../action';
import Select from 'react-select';
import { listCategories } from '../action';
import { formatDateTime, formatDuration } from '../../../config/util';
import CategoryPicker from './CategoryPicker';
import { HANDLING_TIME_MAX, HANDLING_TIME_SEC } from '../../../config/globals';
import { listQueues } from '../../../actions/configurations';

class AddDisposionNote extends Component {
    constructor(props) {
        super(props);

        this.state = {
            catagories: [],
            message: "",
            template: "",
            messageDate: "",
            cursorPosition: 0,
            number_readonly: false,
            timer: 0
        };
    }

    componentDidUpdate(prevProps) {
        this.init(prevProps, this.props);
    }

    componentDidMount() {
        const self = this;
        this.props.listQueues();
        this.props.listCategories(this.getQueue(), (catagories) => {
            this.setState({ catagories })
        });

        this.dispositionTimer = setInterval(() => {
            this.setState({ timer: this.state.timer + 1 }, () => {
                if (HANDLING_TIME_MAX < this.state.timer) {
                    self.props.onClose();
                }
            });
        }, 1000)
        this.init({}, this.props);
    }

    componentWillUnmount() {
        clearInterval(this.dispositionTimer);
    }

    getQueue() {
        console.log("last call queue", this.props.queue);
        if (this.props.queue) {
            if (isNaN(this.props.queue)) {
                const queue = _.find(this.props.queues, { display_name: this.props.queue });
                if (queue) {
                    return queue.extension;
                }
            } else {
                return this.props.queue;
            }
        }
    }

    init(oldProps, newProps) {
        if (newProps.customer_number && oldProps.customer_number !== newProps.customer_number ||
            newProps.queues && oldProps.queues !== newProps.queues ||
            newProps.queue && oldProps.queue !== newProps.queue) {
            this.setState({ customer_number: newProps.customer_number, number_readonly: true, timer: newProps.elapsed_time, loading: false });
            this.props.listCategories(this.getQueue(), (catagories) => {
                this.setState({ catagories })
            });
        }

        // if (!newProps.note && !this.state.message) {
        //     const t = this.props.disposition_templates[0];
        //     this.selectTemplate({ value: t.note_description, label: t.note_data });
        // }

        if (newProps.note && newProps.note !== oldProps.note) {
            let sub_category, sub_sub_category = null;
            const { customer_number, id } = newProps.note;
            const category = _.find(this.state.catagories, { name: newProps.note.category });

            if (category && newProps.note.sub_category) {
                sub_category = _.find(category.children, { name: newProps.note.sub_category })
            }

            if (sub_category && newProps.note.sub_sub_category) {
                sub_sub_category = _.find(sub_category.children, { name: newProps.note.sub_sub_category });
            }

            this.setState({ id, customer_number, category, sub_category, sub_sub_category, timer: newProps.elapsed_time, loading: false })
        }
    }


    handleReminderDateChange(date) {
        this.setState({
            due_on: date
        });
    }

    save(e) {
        e.preventDefault();

        let category, sub_category, sub_sub_category = "";

        let service = _.find(this.props.queues, { extension: this.getQueue() });
 
        if(service){
            service = service.display_name;
        }


        if (!this.state.category) {
            window.alert("Please select the category");
            return;
        } else {
            category = this.state.category.note_data;
        }

        const disResult = this.state.catagories.find(obj => obj.note_data == category);

        if (this.state.customer_number) {
            const self = this;
            self.setState({ loading: true });

            this.props.send({
                id: self.state.id,
                "customer_number": self.state.customer_number,
                "category": category,
                "sub_category": sub_category,
                "sub_sub_category": sub_sub_category,
                "comments": self.state.message,
                "handling_time": self.state.timer,
                "exceeded_time": HANDLING_TIME_SEC > self.state.timer ? 0 : self.state.timer - HANDLING_TIME_SEC,
                "disposition_class": disResult.disposition_class,
                "disposition_code": disResult.disposition_code,
                "disposition_type": disResult.disposition_type,
                "service": service,
                "call_type": this.state.template ? this.state.template.value : ""
            }, () => {
                this.setState({
                    id: null,
                    message: "",
                    template: "",
                    category: null,
                    sub_category: null,
                    sub_sub_category: null,
                    cursorPosition: 0,
                    loading: false
                });
                this.props.onClose();
            })
        } else {
            window.alert("Please enter a valid mobile phone number");
        }
    }

    selectTemplate(template) {
        this.setState({ template });
    }

    addDateToMessage() {
        const { message, cursorPosition } = this.state;
        this.setState({ "message": [message.slice(0, cursorPosition).trim(), formatDateTime(this.state.messageDate), message.slice(cursorPosition).trim()].join(' ').trim() });
    }

    render() {
        const { disposition_templates } = this.props;
        const { category, sub_category, sub_sub_category } = this.state;
        // console.log(disposition_templates)
        return (

            <form onSubmit={(e) => this.save(e)}>
                <Row>
                    <Col>
                        <Alert className='text-center' color={this.state.timer > HANDLING_TIME_SEC ? 'danger' : 'info'}>
                            <b>{formatDuration(Math.abs(HANDLING_TIME_SEC - this.state.timer))}</b> {this.state.timer > HANDLING_TIME_SEC ? `exceeded. Auto close in ${Math.max(HANDLING_TIME_MAX - this.state.timer, 0)} seconds` : 'remaining'}
                        </Alert>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Customer Number</label>
                            <Input
                                placeholder="94XXXXXXXXX"
                                type="number"
                                required
                                readOnly={this.state.number_readonly}
                                value={this.state.customer_number}
                                onChange={(e) => this.setState({ customer_number: e.target.value })}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <CategoryPicker disposition_categories={this.state.catagories} value={{ category, sub_category, sub_sub_category }}
                            onChange={(data) => this.setState({ ...data, message: data.category ? data.category.note_data : "" })}

                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Call Type</label>
                            {disposition_templates &&
                                <Select
                                    name="form-field-name2"
                                    value={this.state.template}
                                    options={disposition_templates.map(t => { return { value: t.note_description, label: t.note_description } })}
                                    onChange={(e) => this.selectTemplate(e)}
                                    placeholder="Choose a Call Type"
                                    className="mb-2"
                                />}
                          
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <label>Message</label>
                            <Input placeholder="Note" type="textarea" value={this.state.message}
                                onChange={(e) => this.setState({ message: e.target.value, cursorPosition: e.target.selectionStart })}
                                onKeyUp={(e) => this.setState({ cursorPosition: e.target.selectionStart })}
                                onClick={(e) => this.setState({ cursorPosition: e.target.selectionStart })}
                                rows="5" />
                        </FormGroup>
                    </Col>
                </Row>
              
                <Row>
                    <Col className="text-right">
                        <div className="d-flex">
                            <div>
                                <DatePicker
                                    selected={this.state.messageDate}
                                    onChange={(date) => this.setState({ messageDate: date })}
                                    showTimeSelect
                                    customInput={<Button><i className="fa fa-calendar"></i></Button>}
                                />
                            </div>
                            {this.state.messageDate ? <Button className="ml-1" outline onClick={() => this.addDateToMessage()}><i className="fa fa-paste"></i> {formatDateTime(this.state.messageDate)}</Button> : ""}
                            <div className="ml-auto">
                                {/* <Button type="button" onClick={() => this.props.onClose()} outline color="danger">Cancel</Button> */}
                                <Button disabled={this.state.loading} type="submit" className="ml-1" color="primary">Add Note</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </form>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        send,
        listCategories,
        listQueues
    }, dispatch);
}

function mapStateToProps({ disposition_categories, disposition_templates, queues }) {
    return {
        disposition_categories,
        disposition_templates,
        queues
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AddDisposionNote);
