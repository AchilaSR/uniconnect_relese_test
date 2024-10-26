import React, { useState } from 'react';
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from 'redux';
import { searchRecords } from '../../action';
import { CRM_FIELDS_PHONE } from '../../../../config/globals';
import history from '../../../../history';

function ContactButton({ value, children, className, searchRecords, newTab }) {
    const [loading, setLoading] = useState(false);

    const navigateToContacts = async () => {
        setLoading(true);
        Promise.all(CRM_FIELDS_PHONE.map((field) => {
            let query = [{
                field, value
            }];
            return new Promise((resolve) => {
                searchRecords("Contacts", query, (err, data) => {
                    resolve(data);
                }, true);
            })
        })).then((res) => {
            const contact = _.uniqBy(res.flat(), "id").filter((a) => (a));
            setLoading(false);
            if (contact.length > 0) {
                console.log("contact", contact);
                if (newTab) {
                    window.open(`/contacts/${contact[0].id}`, "_blank");
                } else {
                    history.push(`/contacts/${contact[0].id}`, contact);
                }
            } else {
                if (window.confirm("Contact profile is not available in the CRM? Do you want to create a new Profile?")) {
                    if (newTab) {
                        window.open(`/contacts?searchBy=phone&search=${value}`, "_blank");
                    } else {
                        history.push(`/contacts?searchBy=phone&search=${value}`);
                    }
                };
            }
        });
    }

    return (<button disabled={!value || loading} onClick={() => navigateToContacts()} className={className}>{loading ? <i className='fa fa-spin fa-circle-o-notch'></i> : children}</button>)
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(ContactButton);
