import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from "react-redux";
import _ from "lodash";
import { searchRecords } from '../../action';
import { CRM_FIELDS_PHONE, HOMEPAGE } from '../../../../config/globals';

function FieldValue({ module, id, crm_records, searchRecords }) {
    const [selected, select] = useState();
    const [selectedObj, selectObj] = useState();
    const [searched, setSearched] = useState([]);
    const [isOpen, open] = useState(false);

    if (!Array.isArray(module)) {
        module = [module];
    }

    useEffect(() => {
        if (id) {
            module.forEach(module => {
                let a = _.find(crm_records[module], { id });

                if (!a && module === "Users") {
                    a = _.find(crm_records["Groups"], { id });
                    if (a) {
                        select(a.groupname);
                        return;
                    }
                }

                if (a) {
                    switch (module) {
                        case "Products":
                            select(a.productname);
                            break;
                        case "Accounts":
                            select(a.accountname);
                            break;
                        case "Assets":
                            select(a.assetname);
                            break;
                        case "Contacts":
                            select(a.firstname + " " + a.lastname);
                            selectObj(a);
                            break;
                        case "Users":
                            select(a.first_name + " " + a.last_name);
                            break;
                    }
                } else {
                    if (searched.indexOf(module) === -1) {
                        setSearched([...searched, module]);
                        if (module === "Users" && !crm_records['Groups']) {
                            searchRecords("Groups", [], null, true);
                        }

                        searchRecords(module, [{
                            "field": "id",
                            "value": id
                        }], undefined, true);
                    }
                }
            });
        }
    }, [crm_records[module], id])

    if (selectedObj) {
        return <div>
            <b style={{ cursor: "pointer" }} onClick={() => { open(!isOpen) }} href="#">{selected}</b>
            {isOpen ? <div>
                {[...(new Set(CRM_FIELDS_PHONE.map((a) => selectedObj[a])))].map(a => <div>{a}</div>)}
                <a href={`${HOMEPAGE}/contacts/${selectedObj.id}`}>View Details</a>
            </div> : ""}
        </div>
    }
    return <span>{selected}</span>
}

function mapStateToProps({ crm_records }) {
    return {
        crm_records,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldValue);
