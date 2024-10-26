import React from 'react';
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from 'redux';
import { searchRecords } from '../../action';
import { components } from 'react-select';
import Select from 'react-select/async';

const getSearchFields = (module) => {
    switch (module) {
        case "Products":
            return ["productname"];
        case "Accounts":
            return ["accountname"];
        case "Assets":
            return ["assetname"];
        case "Contacts":
            return ["firstname", "lastname"];
        case "Users":
            return ["first_name", "last_name"];
        default:
            return "id";
    }
}

function FieldPicker({ value, onChange, module, crm_records, searchRecords, filters, user, readOnly, required, filter }) {

    if (Array.isArray(module)) {
        module = module[0];
    }

    if (typeof value === "string" && value) {
        const tmp = _.find(crm_records[module], { id: value });

        if (!tmp) {
            searchRecords(module, [{ field: "id", value }], null, true);
        } else {
            value = tmp;
            onChange({ ...value, value: value.id });
        }
    }

    if (module === "Users" && value) {
        const tmp = _.find(crm_records['Groups'], { id: value });

        if (tmp) {
            value = tmp;
            onChange({ ...value, value: value.id });
        }
    }


    // console.log("field", { value, onChange, module, crm_records, searchRecords, filters, user, readOnly });
    if (module === "Users" && !value && !filter) {
        const tmp = _.find(crm_records[module], { user_name: user.login_username });

        if (!tmp) {
            searchRecords(module, [{ field: "user_name", value: user.login_username }], null, true);
        } else {
            value = tmp;
            onChange({ ...value, value: value.id });
        }
    }

    if (module === "Users" && !crm_records['Groups']) {
        searchRecords("Groups", [], null, true);
    }

    const searchField = getSearchFields(module);

    const searchData = (value, next) => {
        // let query = searchField.map((field) => ({
        //     field, value
        // }));

        // if (filters) {
        //     query = [...query, ...filters];
        // }

        // searchRecords(module, query, (err, data) => {
        //     next(data);
        // }, true);
        if (Array.isArray(searchField)) {
            Promise.all(searchField.map((field) => {
                let query = [{ field, value }];

                if (filters) {
                    query = [...query, ...filters];
                }

                return new Promise((resolve) => {
                    searchRecords(module, query, (err, data) => {
                        resolve(data);
                    }, true);
                })

            })).then((res) => {
                console.log({ res })
                res = res.filter((a) => a);
                if (res) {
                    next(sortOption(_.uniqBy(res.flat(), "id") || []));
                }
            });

        }
    }

    const searchDataDebounce = _.debounce(searchData, 300)


    const sortOption = (options = []) => {
        const a = options.sort((a, b) => {
            a = [...searchField.map((f) => a[f]), a.groupname].join(" ");
            b = [...searchField.map((f) => b[f]), b.groupname].join(" ");
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1
            }
            return 0;
        });
        // console.log("sorted", a);
        return a;
    }

    const DropdownIndicator = props => {
        return (
            <components.DropdownIndicator {...props}>
                <div style={{ width: 20, textAlign: "center" }}>
                    <i className='fa fa-search'></i>
                </div>
            </components.DropdownIndicator>
        );
    };

    return (<Select
        value={value}
        components={{ DropdownIndicator }}
        defaultOptions={sortOption(module === "Users" ? [{ label: "Users", options: (crm_records[module] || []) }, { label: "Groups", options: (crm_records["Groups"] || []) }] : (crm_records[module] || []))}
        cacheOptions
        loadOptions={searchDataDebounce}
        placeholder="Search"
        onChange={(e) => {
            if (e) {
                onChange({ ...e, value: e.id });
            }
            else {
                onChange({});
            }
        }}
        isMulti={false}
        getOptionValue={option => option['id']}
        getOptionLabel={option => [...searchField.map((f) => option[f]), option.groupname].join(" ")}
        className="multi-select"
        isClearable={true}
        required={required}
        isDisabled={readOnly}
        menuPortalTarget={document.body}
        menuPosition={'fixed'}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
    />)
}

function mapStateToProps({ crm_records, user }) {
    return {
        crm_records, user
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldPicker);
