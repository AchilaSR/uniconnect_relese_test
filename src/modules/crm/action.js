import { toastr } from 'react-redux-toastr';
import axios from 'axios';
import _ from 'lodash';
import { API_URL, CRM_FIELDS_PHONE, LOCAL_PHONE_NUMBER_LENTGH } from '../../config/globals';
import { MODULE_LAYOUT_LOADED, FIELD_LIST_LOADED, GET_ALL_RECORDS, RECORD_LOADED, GET_ALL_RECORDS_BY_PAGE, GET_RECENT_ACTIVITY, GET_SORT_FIELDS } from './config';
import { CUSTOM } from '../../custom';
import FormData from "form-data";

axios.defaults.headers.common['Content-Type'] = "application/json";

const handleCrmError = (error) => {
    if (error.response && error.response.data.message) {
        toastr.error('CRM Error', error.response.data.message);
    } else {
        toastr.error('Error', error.message);
    }
}

export const getModuleDescription = (module) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/helpdesk/DescribeModule',
            params: {
                uct: "1",
                module
            },
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: MODULE_LAYOUT_LOADED, module, payload: response.data });
            } else {
                toastr.error('Error', 'Failed to get data');
            }
        }).catch(handleCrmError);
    }
}

export const getFieldView = (module) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/helpdesk/getFieldView',
            params: {
                uct: "1",
                module
            },
        }).then(function (response) {
            if (response.data && response.data.length && response.data[0].fieldList && response.data[0].fieldList.data) {
                dispatch({ type: FIELD_LIST_LOADED, module, payload: response.data[0].fieldList.data || [] });
            } else {
                dispatch({ type: FIELD_LIST_LOADED, module, payload: [] });
            }
        }).catch(handleCrmError);
    }
}


export const getRecentActicity = (entity_id, module) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: API_URL + '/helpdesk/RecentActivity',
            params: {
                uct: "1",
                module,
                entity_id
            },
        }).then(function (response) {
            if (response.data) {
                const data = response.data;
                dispatch({ type: GET_RECENT_ACTIVITY, module, payload: data });
            } else {
                // toastr.error('Error', 'Failed to get data');
            }
        }).catch(handleCrmError);
    }
}

export const getAllRecords = (module, page = 0) => {
    const page_size = 100;
    return (dispatch, getState) => {
        dispatch({ type: GET_ALL_RECORDS, module, payload: null });
        axios({
            method: 'get',
            url: API_URL + '/helpdesk/Pagination',
            params: {
                uct: "1",
                module,
                page,
                page_size,
                sortField: "id",
                sortOrder
            },
        }).then(function (response) {
            if (response.data && response.data.data) {
                dispatch({ type: GET_ALL_RECORDS, module, payload: response.data.data, page });
                if (response.data.data.length === page_size) {
                    page = page + 1;
                    dispatch(getAllRecords(module, page));
                }
            }
        }).catch(handleCrmError);
    }
}

export const getAllRecordsByPage = (module, page = 0, page_size = 10, next, sortField = "id", sortOrder = "desc") => {
    return (dispatch, getState) => {
        // dispatch({ type: GET_ALL_RECORDS_BY_PAGE, module, payload: null });
        axios({
            method: 'get',
            url: API_URL + '/helpdesk/Pagination',
            params: {
                uct: "1",
                module,
                page,
                page_size,
                sortField: sortField,
                sortOrder: sortOrder
            },
        }).then(function (response) {
            if (response.data && response.data.data) {
                if (response.data.data) {
                    dispatch({ type: GET_ALL_RECORDS_BY_PAGE, module, payload: response.data.data });
                }

                if (typeof next === "function") {
                    next(response.data.count);
                }
            } else {
                toastr.error('Error', 'Failed to get data');
            }
        }).catch((error) => {
            console.error('API Error:', error);
        });
    }
}



export const setSortOrder = (sortOrder) => ({
    type: 'SET_SORT_ORDER',
    sortOrder,
});

export const searchRecords = (module, data, next, isSingle = false, sort = "", page = 0, page_size = 1000) => {
    if (typeof next !== "function") {
        next = () => { }
    }
    if (module == "ModComments") {
        if (typeof data === "string") {
            if (!data.includes("related_to")) {
                data = data.replace("contact_id", "related_to");
            }
        }
    }
    let searchBy = "query";

    if (sort === "" && module !== "Users") {
        sort = "ORDER BY createdtime DESC";
    }

    if (typeof data !== "string") {
        data = data.filter((a) => a.value);
        data = data.map((a) => {
            if (CRM_FIELDS_PHONE.indexOf(a.field) > -1) {
                return { ...a, value: "%" + a.value.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH) }
            } else {
                return a;
            }
        });

        data = data.map((a) => {
            return `${a.field} LIKE '%${a.value}%'`
        }).join(" AND ")
    }

    if (!data.trim()) {
        searchBy = "search_fileds";
        data = [];
    } else {
        data = `${data} ${sort} LIMIT ${page * page_size}, ${page_size}`
    }

    return (dispatch, getState) => {
        if (!isSingle) {
            dispatch({ type: GET_ALL_RECORDS_BY_PAGE, module, payload: null });
        }
        if (data.includes("undefined")) {
            data = data.replace("undefined", "account_id");
        }

        axios({
            method: 'post',
            url: API_URL + '/helpdesk/SearchRecord',
            params: {
                uct: "1",
                module
            },
            data: {
                "module_name": module,
                [searchBy]: data
            }
        }).then(function (response) {
            if (response.data && response.data.data) {
                let { data, count } = response.data;
                const contact = _.find(data, { field: "contact_id" });
                const customer = _.find(data, { field: "customer" });

                if (contact) {
                    data = _.filter(data, contact);
                }

                if (customer) {
                    data = _.filter(data, customer);
                }

                if (!isSingle) {
                    dispatch({ type: GET_ALL_RECORDS_BY_PAGE, module, payload: data });
                }

                next(null, data, parseInt(count));

                if (data) {
                    dispatch({ type: GET_ALL_RECORDS, module, payload: data });
                }
            } else {
                if (!isSingle) {
                    dispatch({ type: GET_ALL_RECORDS_BY_PAGE, module, payload: [] });
                }
                next('Failed to load data');
            }
        }).catch(function (error) {
            if (!isSingle) {
                handleCrmError(error);
            }
            next(error)
        });
    }
}
export const addRecord = (module, data, profile, next) => {
    if (CUSTOM && CUSTOM.CRM_INGESTIONS && CUSTOM.CRM_INGESTIONS[module]) {
        data = { ...CUSTOM.CRM_INGESTIONS[module], ...data };
    }

    return (dispatch, getState) => {
        if (!data.id) {
            const all_users = getState().crm_records["Users"]
            const current_user = _.find(all_users, { user_name: getState().user.login_username });
            if (current_user) {
                data.creator = current_user.id;
            }
        }

        axios({
            method: 'post',
            url: `${API_URL}/helpdesk/${data.id ? "UpdateRecord" : "AddRecord"}`,
            params: {
                uct: "1",
                username: getState().user.crm_user.user_name,
                accessKey: getState().user.crm_user.accesskey,
                module
            },
            data
        }).then(function (res) {
            if (profile && data?.related_to?.split('x')[0] !== "17") {
                dispatch(searchRecords(module, profile, next));
            }

            if (data.id) {
                dispatch(getRecord(module, data.id));
            }

            next(null, res.data);
        }).catch(function (error) {
            handleCrmError(error);
            next(error.message);
        });
    }
}
export const deleteRecord = (module, record_id, search, next = () => { }) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: `${API_URL}/helpdesk/DeleteRecord`,
            params: {
                uct: "1",
                module,
                username: getState().user.crm_user.user_name,
                accessKey: getState().user.crm_user.accesskey,
                record_id
            }
        }).then(function (response) {
            if (search) {
                dispatch(searchRecords(module, search));
            } else {
                dispatch(getAllRecordsByPage(module));
            }
        }).catch(handleCrmError).finally(() => {
            next();
        });
    }
}

export const getRecord = (module, record_id, next = () => { }) => {
    return (dispatch, getState) => {
        axios({
            method: 'get',
            url: API_URL + '/helpdesk/RetriveRecord',
            params: {
                uct: "1",
                module,
                record_id
            },
        }).then(function (response) {
            if (response.data) {
                dispatch({ type: RECORD_LOADED, module, payload: response.data });
                next(null, response.data)
            } else {
                next('Failed to retrieve data')
                toastr.error('Error', 'Failed to retrieve data');
            }
        }).catch(function (error) {
            next(error.message);
            handleCrmError(error);
        });
    }
}
export const setFieldView = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: `${API_URL}/helpdesk/setFieldView`,
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            toastr.success('Success', "Field list updated");
            dispatch(getFieldView(data.module_name));
            next()
        }).catch(handleCrmError);
    }
}

export const getDocumentList = (ticket_id, next) => {
    return (dispatch, getState) => {
        axios.request({
            method: 'get',
            url: `${API_URL}/helpdesk/Document/List`,
            params: {
                ticket_id,
                task: "ticket_doc_list"
            }
        }).then((response) => {
            if (response.data && response.data.data) {
                next(null, response.data.data)
            }
        }).catch((error) => {
            next(error)
        });
    }
}


export const deleteDocument = (ticket_id, document_id, next) => {
    return (dispatch, getState) => {
        axios.request({
            method: 'get',
            url: `${API_URL}/helpdesk/Document/Delete`,
            params: {
                ticket_id,
                document_id
            }
        }).then((response) => {
            next(null)
        }).catch((error) => {
            next(error)
        });
    }
}

export const downloadDocument = (document_id, next) => {
    return (dispatch, getState) => {
        axios.request({
            method: 'get',
            url: `${API_URL}/helpdesk/Document/Download`,
            params: {
                task: "download_document",
                document_id
            }
        }).then((response) => {
            console.log(response.data);
            next(null, response.data)
        }).catch((error) => {
            next(error)
        });
    }
}

export const uploadDocument = (data, next) => {
    return (dispatch, getState) => {
        axios.post(`${API_URL}/helpdesk/Document/Upload`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then((response) => {
            if (response.data && response.data.status) {
                next(null, response.data)
            } else {
                next(response.data)
            }
        }).catch((error) => {
            next(error)
        });
    }
}


export const getCounts = (data, next) => {
    return (dispatch, getState) => {
        axios({
            method: 'post',
            url: `${API_URL}/helpdesk/SearchAndGroupBy`,
            params: {
                uct: "1",
            },
            data
        }).then(function (response) {
            next(null, response.data)
        }).catch(handleCrmError);
    }
}