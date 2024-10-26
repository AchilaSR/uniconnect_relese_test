import { toastr } from "react-redux-toastr";
import axios from "axios";
import { API_URL } from "../config/globals";
import { ROLES_LOADED } from "./config";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const listRoles = () => {
  return (dispatch, getState) => {
      axios({
        method: "get",
        url: API_URL + "/AccessManager/RolesList",
        params: {
          uct: "1",
        },
      })
        .then(function (response) {
          dispatch({ type: ROLES_LOADED, payload: response.data.roles });
        })
        .catch(function (error) {
          toastr.error("Error", error.message);
        });
  };
};

export const deleteRole = (props) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/AccessManager/RoleDelete",
      params: {
        uct: "1",
        role_id: props,
      },
    })
      .then(function (response) {
        if (response.data) {
          if (response.data.status !== "error") {
            toastr.success("Success", response.data.message);
          }
          dispatch(listRoles());
        } else {
          // toastr.error("Error", "Failed to delete Role");
        }
      })
      // .catch(function (error) {
      //   toastr.error("Error", error.message);
      // });
  };
};
      
export const createRole = (props, next) => {
  return (dispatch, getState) => {
    const rules = props.rules.filter(Boolean);
    console.log(props)
    axios({
      method: "post",
      url: API_URL + "/AccessManager/RoleAdd",
      params: {
        uct: "1",
      },
      data: {
        name: props.role_name,
        description: props.role_description,
        rules: rules,
        isDefault: props.isDefault,
      },
    })   
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(listRoles());
          next();
        } else {
          next(true);
          toastr.error("Error", "Failed to create the role");
        }
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};

export const updateRole = (props, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/AccessManager/RoleModify",
      params: {
        uct: "1",
      },
      data: {
        role_id: props.role_id,
        name: props.role_name,
        description: props.role_description,
        rules: props.rules,
        isDefault: props.isDefault
      },
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          next();
          dispatch(listRoles());
        } else {
          next(true);
          toastr.error("Error", "Failed to update the role");
        }
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};


export const setDefaultRole = (role_id, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/AccessManager/setDefault",
      params: {
        uct: "1",
      },
      data: {
        role_id: role_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          // toastr.success("Success", response.data.message);
          // next();
          // dispatch(listRoles());
        } else {
          // next(true);
          // toastr.error("Error", "Failed to update the role");
        }
      })
      // .catch(function (error) {
      //   next(error);
      //   toastr.error("Error", error.message);
      // });
  };
};