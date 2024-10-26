import React, { useState } from 'react';
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from 'redux';
import { searchRecords } from '../../action';
import { CRM_FIELDS_PHONE } from '../../../../config/globals';
import history from '../../../../history';
import { Input } from 'reactstrap';
import { formatPhone } from '../../../../config/util';

function UniqueField({ value, onChange, field, module, id, searchRecords, readOnly = false }) {
    const [loading, setLoading] = useState(false);

    const setValue = async (e) => {
        setLoading(true);
        e.persist();
        e.target.setCustomValidity("");

        let value = e.target.value;
        if (CRM_FIELDS_PHONE.indexOf(field.name) > -1) {
            value = formatPhone(value);
            if (!value) {
                e.target.setCustomValidity("Invalid phone number");
                return;
            }
        }

        let query = [{
            field: field.name, value: value
        }];

        searchRecords(module, query, (err, data) => {
            if (data) {
                const record = _.find(data, { [field.name]: value });
                if (record) {
                    if (!id || (id && id !== record.id)) {
                        e.target.setCustomValidity(`Duplicate ${module} exists with the same value for ${field.label}`);
                    }
                }
            }
        }, true);
    }

    return (<Input
        placeholder={`Enter the ${field.label}`}
        required={field.mandatory}
        value={value}
        readOnly={readOnly}
        onChange={(e) => {
            onChange(e.target.value);
            setValue(e)
        }} />)
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(UniqueField);
