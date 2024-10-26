import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Label, Input, ListGroup, ListGroupItem, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFieldView, getModuleDescription, setFieldView } from '../action';
import { MODULES } from '../config';
import FieldSelector from './components/fieldSelector';
import { CUSTOM } from '../../../custom';

class Field extends Component {

    constructor(props) {
        super(props);
        this.state = { module: "", edited: false }
    }

    componentDidMount() {
        (Object.keys(CUSTOM.CRM_MODULES || MODULES)).forEach((module) => {
            this.props.getModuleDescription(module);
            this.props.getFieldView(module);
        })
    }

    onFieldClick(item) {
        const list = this.state.field_list;
        const index = list.indexOf(item);
        this.setState({ edited: true });

        if (index === -1) {
            this.setState({ field_list: [...list, item] })
        } else {
            list.splice(index, 1);
            this.setState({ field_list: list })
        }
    }

    save() {
        this.props.setFieldView({
            "module": this.state.module,
            "fieldList": { data: this.state.field_list }
        }, () => {
            this.setState({ edited: false });
        })
    }

    changeModule(e) {
        const { field_list } = this.props;
        const module = e.target.value;

        console.log({
            module: module,
            field_list: field_list[module],
            edited: false
        });
        this.setState({
            module: module,
            field_list: field_list[module],
            edited: false
        });
    }

    render() {
        const { module_description } = this.props;

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Field Layout</li>
                </ol>
                <div className="container-fluid">
                    <div className='d-flex'>
                        <div className='mr-3' style={{ width: 300 }}>
                            <Card>
                                <CardHeader>Settings</CardHeader>
                                <CardBody>
                                    <FormGroup>
                                        <Label htmlFor="name">Select Module</Label>
                                        <Input value={this.state.module} onChange={(e) => this.changeModule(e)} type="select">
                                            <option>Select Module</option>
                                            {
                                                (Object.keys(CUSTOM.CRM_MODULES || MODULES)).map((a) =>
                                                    module_description[a] ? <option value={a} >{(CUSTOM.CRM_MODULES || MODULES)[a]}</option> : ""
                                                )
                                            }
                                        </Input>
                                    </FormGroup>
                                    {
                                        this.state.edited ? <Button color="primary" onClick={() => this.save()} >Save</Button> : ""
                                    }
                                </CardBody>
                            </Card>
                        </div>{
                            this.state.module ?
                                <FieldSelector
                                    module={this.state.module}
                                    data={module_description[this.state.module]}
                                    value={this.state.field_list}
                                    onChange={(e) => { this.setState({ field_list: e, edited: true }) }}
                                />
                                : ""}
                    </div>
                </div>
            </div >
        );
    }
}

function mapStateToProps({ field_list, module_description }) {
    return {
        field_list: field_list,
        module_description: module_description,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFieldView,
        getModuleDescription,
        setFieldView
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(Field));
