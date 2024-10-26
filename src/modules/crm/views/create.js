import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import 'react-dates/initialize';
import "react-datepicker/dist/react-datepicker.css";
import { addRecord, getFieldView, getModuleDescription } from '../action';
import Loader from '../../../components/Loader';
import _ from 'lodash';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import correctDate from './components/dateField';
import FieldValue from './components/FieldValue';
import FieldPicker from './components/FieldPicker';
import { CRM_FIELDS_ASSET, CRM_FIELDS_PHONE, CRM_HIDE_DEPENDENT_FIELDS_ON_VIEW } from '../../../config/globals';
import { formatPhone } from '../../../config/util';
import UniqueField from './components/uniqueField';
import { CUSTOM } from '../../../custom';
import DocumentList from './components/documentList';
import { getDependencies } from '../../crm-forms/action';
import DynamicDropDown from '../../../components/DynamicDropdown';
import { CONTACT_RELATIONS } from '../config';

if (!CUSTOM.CRM_VALIDATIONS) {
    CUSTOM.CRM_VALIDATIONS = {}
}

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = { visibleFields: {} };
        this.documentRef = React.createRef();
    }

    clearForm() {
        const data = { ...this.state }
        Object.keys(data).forEach(key => {
            const field = _.find(this.props.module_description, { name: key });
            if (field) {
                if (field.type.name === "reference") {
                    data[key] = {};
                } else {
                    data[key] = field.default;
                    // this.fieldValueChange(key, field.default);
                }
            }
        });
        this.setState({ ...data });
    }

    componentDidMount() {
        this.init({});
        this.props.getDependencies(this.props.module);
    }

    componentDidUpdate(prevProps) {
        this.init(prevProps);
    }

    init(prevProps) {
        if (this.props.module_description) {
            if (JSON.stringify(this.props.module_description) !== JSON.stringify(prevProps.module_description) || JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data) || this.props.mode !== prevProps.mode) {
                if (this.props.data) {
                    const d = {};
                    // let all_fields = this.props.field_list;

                    // if (this.props.mode !== "view") {
                    //     const mandatory_fields = this.props.module_description.filter((a) => a.mandatory).map(a => a.name);
                    //     all_fields = _.uniq([...this.props.field_list, ...mandatory_fields]);
                    // }

                    this.props.module_description.map((field) => {
                        if (field.type && field.type.picklistValues) {
                            if (field.type.name === "multipicklist") {
                                if (this.props.data[field.name]) {
                                    d[field.name] = this.props.data[field.name].split("|##|").map((a) => {
                                        return _.find(field.type.picklistValues, { value: a.trim() })
                                    })
                                } else {
                                    d[field.name] = []
                                }
                            } else {
                                d[field.name] = _.find(field.type.picklistValues, { value: this.props.data[field.name] })
                                // this.fieldValueChange(field.name, this.props.data[field.name]);
                            }
                        } else if (field.type.name === "date" || field.type.name === "datetime") {
                            d[field.name] = this.props.data[field.name];
                        } else if (CUSTOM.FIELD_ALIAS && CUSTOM.FIELD_ALIAS[field.name] && this.props.data[CUSTOM.FIELD_ALIAS[field.name]]) {
                            d[field.name] = this.props.data[CUSTOM.FIELD_ALIAS[field.name]];
                        } else {
                            d[field.name] = this.props.data[field.name];
                        }
                    });

                    this.setState({ ...d }, () => {
                        if (this.props.data.account_id) {
                            this.setState({ account_id: this.props.data.account_id });
                        }

                        // if (this.props.module === "HelpDesk" && this.props.mode === "create") {
                        //     this.setState({ assigned_user_id: null });
                        // }
                    });
                } else {
                    this.clearForm();
                }
            }
        } else {
            this.props.getModuleDescription(this.props.module);
            this.props.getFieldView(this.props.module);
        }
    }

    save(e) {
        e.preventDefault();
        const data = { ...this.state };

        if (this.props.data && this.props.data.id) {
            data.id = this.props.data.id;
        }

        for (var key in data) {
            if (typeof data[key] === "object") {
                if (data[key] instanceof Date) {
                    data[key] = moment(data[key]).format("YYYY-MM-DD");
                } else if (Array.isArray(data[key])) {
                    data[key] = data[key].map((a) => a.value).join(" |##| ");
                } else if (data[key]) {
                    data[key] = data[key].value;
                }
            } else {
                if (data[key] && CRM_FIELDS_PHONE.indexOf(key) > -1) {
                    data[key] = formatPhone(data[key]);
                    if (!data[key]) {
                        alert("Invalid Phone Number");
                        return;
                    }
                }
            }
        }

        let filter = "";

        if (this.props.profile && CONTACT_RELATIONS[this.props.module]) {
            filter = `${CONTACT_RELATIONS[this.props.module]} = ${this.props.profile}`;
            data[CONTACT_RELATIONS[this.props.module]] = this.props.profile;
        }

        // Object.keys(data).forEach((key) => {
        //     if (key === "related_to")
        //         data[key] = this.props.profile;
        // })
        this.setState({ clicked: true });
        this.props.addRecord(this.props.module, data, filter, (err, data) => {
            if (this.documentRef.current) {
                if (data && data.id) {
                    this.documentRef.current.getWrappedInstance().saveDoc(data.id);
                }
            }
            this.props.onCancel(data);
            this.setState({ clicked: false });
        });
    }

    // fieldValueChange(field, value) {
    //     let key = "";
    //     if (path) {
    //         key = path + "|";
    //     }
    //     key = key + field;

    //     if (value) {
    //         this.state.visibleFields[key] = value.value;
    //     } else {
    //         delete this.state.visibleFields[key];
    //     }
    //     this.setState({ visibleFields: { ...this.state.visibleFields } })
    // }

    getField(field, label) {
        if (field.type.name === "reference" && field.type.refersTo.indexOf("Contacts") > -1)
            return <FieldPicker
                required={field.mandatory}
                module={"Contacts"}
                value={this.state[field.name] || this.props.profile}
                readOnly={(this.props.module === "HelpDesk" || this.props.module === "ModComments") && this.props.profile}
                onChange={(e) => {
                    this.setState({ [field.name]: e });
                    if (e.account_id) {
                        this.setState({ "account_id": e.account_id });
                    }
                }}
            />

        if (field.type.name === "owner" || (field.type.name === "reference" && field.type.refersTo.indexOf("Users") > -1)) {
            return <FieldPicker
                required={field.mandatory}
                module={"Users"}
                value={this.state[field.name] || this.props.assignee}
                readOnly={(this.props.module === "HelpDesk" || this.props.module === "ModComments") && (this.props.assignee)}
                onChange={(e) => {
                    this.setState({ [field.name]: e });
                }}
            />
        }

        if (field.type.name === "reference" && field.type.refersTo.indexOf("Accounts") > -1) {
            if (!this.state[field.name] && this.state.account_id) {
                this.setState({ [field.name]: this.state.account_id });
            }
            return <FieldPicker
                required={field.mandatory}
                module={field.type.refersTo}
                value={this.state[field.name]}
                onChange={(e) => this.setState({ [field.name]: e })}
            />
        }

        if (field.type.name === "reference") {
            return <FieldPicker
                required={field.mandatory}
                module={field.type.refersTo}
                value={this.state[field.name]}
                onChange={(e) => this.setState({ [field.name]: e })}
            />
        }

        if (CRM_FIELDS_ASSET.indexOf(field.name) > -1)
            return <FieldPicker
                required={field.mandatory}
                module={"Assets"}
                value={this.state[field.name]}
                onChange={(e) => {
                    this.setState({ [field.name]: e });
                }}
                filters={this.state.account_id ? [{ field: "account", value: this.state.account_id }] : null}
            />

        if (field.type.picklistValues) {
            if (!this.state[field.name] && field.type.defaultValue && field.mandatory) {
                this.setState({ [field.name]: _.find(field.type.picklistValues, { value: field.type.defaultValue }) })
            }

            return <Select
                value={this.state[field.name]}
                options={field.type.picklistValues}
                onChange={(e) => {
                    this.setState({ [field.name]: e });
                }}
                isMulti={field.type.name === "multipicklist"}
                getOptionValue={option => option['value']}
                getOptionLabel={option => option['label']}
                className="multi-select"
                isClearable={true}
                required={field.mandatory}
            />
        }

        if (field.type.name === "date" || field.type.name === "datetime") {
            return <DatePicker
                selected={this.state[field.name] ? new Date(this.state[field.name]) : null}
                onChange={(value) => this.setState({ [field.name]: value })}
                showTimeSelect={false}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                {...CUSTOM.CRM_VALIDATIONS[field.name]}
                className="form-control"
                required={field.mandatory}
            />
        }

        if (field.isunique) {
            return <UniqueField readOnly={this.props.mode === "edit" && field.mandatory} required={field.mandatory} module={this.props.module} field={field} id={this.state.id} value={this.state[field.name]} onChange={(e) => this.setState({ [field.name]: e })} />
        }

        return <Input type={field.name === "description" || field.name === "commentcontent" ? "textarea" : field.type.name} rows={5} placeholder={`Enter the ${label}`} required={field.mandatory} value={this.state[field.name]} onChange={(e) => this.setState({ [field.name]: e.target.value })} />
    }

    addFieldLabel(label, mandatory, value) {
        if (value) {
            return <FormGroup>
                <Label>{label} {mandatory ? <span className='text-danger'>*</span> : ""}</Label>
                {
                    value
                }
            </FormGroup>
        }
    }

    checkVisibility(field) {
        const dependencies = this.props.crm_forms[this.props.module][field];
        if (dependencies) {
            const visible = Object.keys(dependencies).reduce((a, b) => {
                const parentVisible = this.checkVisibility(b);
                if (parentVisible) {
                    let value = this.state[b];
                    if (this.state[b] && typeof this.state[b] === "object") {
                        value = this.state[b].value
                    }
                    return a || dependencies[b].indexOf(value) > -1;
                }
            }, false);
            return visible;
        } else {
            return true;
        }
    }

    renderField({ name, label }, path) {
        const { module_description, mode, columns = 1 } = this.props;
        const field = _.find(module_description, { name });

        if(field && CRM_HIDE_DEPENDENT_FIELDS_ON_VIEW){
            if (this.props.crm_forms && this.props.crm_forms[this.props.module] && this.props.crm_forms[this.props.module][field.name]) {
                const visible = this.checkVisibility(field.name);
                if (!visible) {
                    return "";
                }
            }
        }

        if (mode === "view") {
            if (field && this.state[field.name]) {
                return <Col key={name} xs={field.name === "description" || field.name === "commentcontent" ? "12" : (12 / columns).toString()}>
                    <small>{label}</small>
                    <p>
                        <b>
                            {
                                field.name === "description" || field.name === "commentcontent" ? <div className='long_text'>{this.state[field.name]}</div> :
                                    field.type.name === "reference" ? <FieldValue module={field.type.refersTo} id={this.state[field.name]} /> :
                                        field.type.name === "owner" ? <FieldValue module={"Users"} id={this.state[field.name]} /> :
                                            field.type.picklistValues ? field.type.name === "multipicklist" ? Array.isArray(this.state[field.name]) && this.state[field.name].map((a) => a.label).join(", ") : this.state[field.name].label :
                                                field.type.name === "date" || field.type.name === "datetime" ? correctDate(this.state[field.name], field.type.name === "date") :
                                                    CRM_FIELDS_ASSET.indexOf(field.name) > -1 ? <FieldValue module={"Assets"} id={this.state[field.name]} /> :
                                                        this.state[field.name]
                            }
                        </b>
                    </p>
                </Col>
            }
        } else {
            if (field && field.editable) {
                if (this.props.crm_forms && this.props.crm_forms[this.props.module] && this.props.crm_forms[this.props.module][field.name]) {
                    const visible = this.checkVisibility(field.name);
                    if (!visible) {
                        return "";
                    }
                }

                if (CUSTOM.CRM_DEPENDENT_FIELDS && CUSTOM.CRM_DEPENDENT_FIELDS[this.props.module]) {
                    const field_dependency = _.find(CUSTOM.CRM_DEPENDENT_FIELDS[this.props.module], (a) => a.fields.includes(field.name));
                    if (field_dependency) {
                        if (field_dependency.fields.indexOf(field.name) === 0) {
                            const dep_values = {};
                            const dep_fields = field_dependency.fields.map((f) => {
                                dep_values[f] = typeof this.state[f] === "object" ? this.state[f].value : this.state[f];
                                return _.find(module_description, { name: f })
                            })

                            return <DynamicDropDown xs={(12 / columns).toString()} value={dep_values} fields={dep_fields} dependencyFilePath={field_dependency.dependency_file} field_list={this.props.field_list} onSelect={(data) => this.setState({ ...this.state, ...data })} />
                        } else {
                            return "";
                        }
                    }
                }

                return <Col key={path || name} xs={field.name === "description" || field.name === "commentcontent" ? "12" : (12 / columns).toString()}>
                    {this.addFieldLabel(label, field.mandatory, this.getField(field, label))}
                </Col>
            }
        }
    }

    closeTicket() {
        let filter = "";

        if (this.props.profile) {
            filter += `contact_id = ${this.props.profile}`;
        }

        this.props.addRecord(this.props.module, { ...this.props.data, ticketstatus: "Closed" }, filter, (err, data) => {
            this.props.onCancel(data);
        });
    }

    checkEmptyValue(fields) {
        return fields.some((f) => this.state[f.name])
    }

    renderCategory(category_name, fields) {
        const form = fields.map(field => this.renderField(field)).filter((a) => a);

        if (form.length) {
            return category_name === "default" ?
                fields.map((field) => this.renderField(field)) :
                this.props.mode !== "view" || this.checkEmptyValue(fields) ?
                    <Col xs="12">
                        <h6 className='border-bottom'>{category_name}</h6>
                        <Row>
                            {form}
                        </Row>
                    </Col> : ""
        }
    }


    render() {
        const { module_description, field_list, mode, crm_records, user, module } = this.props;
        const current_user = _.find(crm_records["Users"], { user_name: user.login_username });


        if (!module_description || !field_list) {
            return <Loader />;
        }

        if (mode !== "view" && field_list.length) {
            const selected_fields = this.props.field_list.reduce((acc, current) => acc.concat(current.fields.map(a => a.name)), []);
            const mandatory_fields = module_description.filter((a) => a.mandatory && !a.default && selected_fields.indexOf(a.name) === -1);
            field_list[0].fields = [...field_list[0].fields, ...mandatory_fields];
        }

        return (
            <>
                <form onSubmit={(e) => this.save(e)}>
                    <Row>
                        {/* {
                        all_fields.map((field) => this.renderField(field))
                    } */}

                        {
                            field_list.map(({ category_name, fields }) => this.renderCategory(category_name, fields))
                        }
                    </Row>
                    {this.props.module === "HelpDesk" ? <DocumentList ref={this.documentRef} deletable={this.props.deletable} editable={this.props.editable && mode !== "view"} id={this.props.data ? this.props.data.id : null} /> : ""}
                    <Row>
                        <Col className='d-flex flex-row-reverse'>
                            <Button className='ml-1' onClick={() => this.props.onCancel()} color="danger">Cancel</Button>
                            {
                                current_user && mode === "view" && this.props.module === "HelpDesk" && this.props.data.ticketstatus !== "Closed" && this.props.data["assigned_user_id"] === current_user.id ? <Button type="button" onClick={() => this.closeTicket()} className='ml-1' color="primary">Mark as Done</Button> : ""
                            }

                            {
                                mode === "view" && this.props.module === "Leads" ? <Button type="button" onClick={() => this.props.onConvertLead()} className='ml-1' color="primary">Convert Lead</Button> : ""
                            }

                            {mode !== "view" ?
                                <Button disabled={this.state.clicked} type="submit" color="primary">Save</Button> : typeof this.props.onEditRow === "function" ? this.props.editable ? <Button onClick={(e) => { e.preventDefault(); this.props.onEditRow() }} color="primary">Edit</Button> : "" : ""}
                            {this.props.module === "Contacts" && mode === "view" && typeof this.props.onViewRow === "function" ? <Button className='mr-auto' onClick={(e) => { e.preventDefault(); this.props.onViewRow(); }} outline color="primary">View Profile</Button> : ""}
                        </Col>
                    </Row>
                </form>
            </>
        );
    }
}

function mapStateToProps({ field_list, module_description, crm_records, user, crm_forms }, props) {
    return {
        field_list: field_list[props.module],
        module_description: module_description[props.module],
        crm_records,
        user,
        crm_forms
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addRecord,
        getDependencies,
        getModuleDescription,
        getFieldView
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Create);
