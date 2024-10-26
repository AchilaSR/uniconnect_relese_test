

import React, { Component } from 'react';
import { connect } from 'react-redux';
import correctDate from '../components/dateField';
import FieldValue from '../components/FieldValue';
import Loader from '../../../../components/Loader';

const MODULE = "Contacts";

class Profile extends Component {
    constructor(props) {
        super(props);

    }

    renderField({name, label}) {
        const colStyle = {
            width: 180
        }
        const { module_description, contact } = this.props;
        const field = _.find(module_description, { name });

        if (field && contact[name]) {
            return <div style={colStyle} className="pb-2" key={name}>
                <small>{label}</small>
                <br />
                <b>{field.type.name === "owner" ? <FieldValue module={"Users"} id={contact[name]} /> :
                    field.type.name === "reference" ? <FieldValue module={field.type.refersTo} id={contact[name]} /> :
                        (field.type.name === "date" || field.type.name === "datetime") ? correctDate(contact[name]) :
                            contact[name] || "Unknown"}</b>
            </div>
        }
    }

    render() {
        const { field_list, contact } = this.props;

        if (!contact) {
            return <Loader />
        }

        const [default_cat , ...rest] = field_list;

        return (
            <div>
                {
                    rest.map(({ category_name, fields }) =>
                        <div xs="12">
                            <h6 className='border-bottom'>{category_name}</h6>
                            <div className="d-flex flex-wrap">
                                {fields.map(field => this.renderField(field))}
                            </div>
                        </div>)
                }
            </div>)
    }
}

function mapStateToProps({ field_list, module_description }) {
    return {
        field_list: field_list[MODULE],
        module_description: module_description[MODULE],
    };
}

export default connect(mapStateToProps, null)(Profile);