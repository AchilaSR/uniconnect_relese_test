import { toastr } from "react-redux-toastr";
import axios from "axios";
import { API_URL } from "../config/globals";
import {
  USERS_LOADED,
  USER_CONFIG_CHANGED,
  USER_CONFIG_LOADED,
  GROUP_CONFIG_LOADED,
  PROFILE_UPDATED,
  USER_IMAGE_LOADED,
  QUEUE_CONFIG_CHANGED,
  RING_MY_MOBILE_CHANGED,
  OUTBOUND_IDS_LOADED,
  OUTBOUND_ID_CHANGED
} from "./config";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const listUsers = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/AccessManager/UserList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: USERS_LOADED, payload: response.data.users });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getOutboundIDList = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/getOutboundIDList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: OUTBOUND_IDS_LOADED, payload: response.data });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const createUser = (props) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/AccessManager/UserAdd",
      params: {
        uct: "1",
      },
      data: {
        login_username: props.login_username,
        login_password: props.login_password,
        login_role_id: props.login_role_id,
        first_name: props.first_name,
        last_name: props.last_name,
        email: props.email,
        phone_office: props.phone_office,
        extension_id: props.extension_id,
        work_group_id: props.work_group_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(listUsers());
        } else {
          toastr.error("Error", "Failed to create the user");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const saveConfig = (data) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/DialerCore/setAgentConfigurations",
      params: {
        uct: "1",
      },
      data: data,
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(loadConfig());
        } else {
          toastr.error("Error", "Failed to update the configurations");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const loadConfig = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/getAgentConfigList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch({ type: USER_CONFIG_CHANGED, payload: response.data });
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getAgentConfig = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/getAgentConfigurations",
      params: {
        uct: "1",
        agent_id: getState().user.login_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch({ type: USER_CONFIG_LOADED, payload: response.data });
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getGroupConfig = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/getAgentGroupConfigurations",
      params: {
        uct: "1",
        group_id: getState().user.user_details.workGroup_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch({ type: GROUP_CONFIG_LOADED, payload: response.data });
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};
export const deleteConfig = (agent_id) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/deleteAgentConfigurations",
      params: {
        uct: "1",
        agent_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch(loadConfig());
        } else {
          toastr.error("Error", "Failed to delete the configurations");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const deleteUser = (props) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/AccessManager/UserDelete",
      params: {
        uct: "1",
        login_id: props,
      },
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(listUsers());
        } else {
          toastr.error("Error", "Failed to delete user");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const updateUser = (props, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/AccessManager/UserModify",
      params: {
        uct: "1",
      },
      data: props,
    })
      .then(function (response) {
        if (response.data) {
          if (response.data.status !== "error") {
            if (getState().user.login_id === props.login_id) {
              dispatch({ type: PROFILE_UPDATED, payload: props });
            }

            toastr.success("Success", response.data.message);
            dispatch(listUsers());
            next();
          } else {
            next(true);
            toastr.error("Error", response.data.message);
          }
        } else {
          toastr.error("Error", "Failed to update user");
        }
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};

export const uploadImage = (props) => {
  return (dispatch, getState) => {
    const formData = new FormData();
    formData.append("file", props.file);
    formData.append("extension", props.extension);

    axios({
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      url: API_URL + "/DialerCore/uploadFile",
      params: {
        uct: "1",
      },
      data: formData,
    })
      .then(function (response) {
        if (response.data) {
          if (response.data.status !== "error") {
            if (getState().user.user_details.extension === props.extension) {
              dispatch(getImage(props.extension));
            }
            toastr.success("Success", response.data.message);
          } else {
            toastr.error("Error", response.data.message);
          }
        } else {
          toastr.error("Error", "Failed to update user");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getImage = (extension) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/getProfileImage",
      params: {
        uct: "1",
        extension: extension,
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch({
            type: USER_IMAGE_LOADED,
            payload: { image: response.data.url, extension },
          });
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

//-----------


export const viewAgentQueueConfigurations = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DIALER/viewAgentQueueConfigurations",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch({ type: QUEUE_CONFIG_CHANGED, payload: response.data });
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const updateAgentQueueConfiguration = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/DIALER/updateAgentQueueConfiguration",
      params: {
        uct: "1",
      },
      data: data,
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(viewAgentQueueConfigurations());
          next();
        } else {
          toastr.error("Error", "Failed to update the configurations");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};


export const setMobileSettings = (props, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/setMobileSettings",
      params: {
        uct: "1",
      },
      data: props,
    })
      .then(function (response) {
        dispatch({ type: RING_MY_MOBILE_CHANGED, payload: props });
        toastr.success("Success", response.data.message);
        next();
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};

export const setOutboundID = (props, next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/setOutboundID",
      params: {
        uct: "1",
        extension: getState().user.user_details.extension,
        id: props.outbound_cli ? props.outbound_cli.id : 0,
        cli: props.outbound_cli ? props.outbound_cli.cli : 0,
      },
    })
      .then(function (response) {
        dispatch({ type: OUTBOUND_ID_CHANGED, payload: props.outbound_cli });
        next();
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};

export const unclockUser = (props) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/unlockAccount",
      params: {
        uct: "1",
        userId: props,
      },
    })
      .then(function (response) {
        if (response.data) {
          toastr.success("Success", response.data.message);
          dispatch(listUsers());
        } else {
          toastr.error("Error", "Failed to unlock the user");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};