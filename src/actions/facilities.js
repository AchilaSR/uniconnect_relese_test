import { toastr } from "react-redux-toastr";
import axios from "axios";
import { API_URL, CAMPAIGN_ALLOW_DUPLICATE_CONTENT, MI_API_URL, NOTIFICATION_CHANNELS } from "../config/globals";
import {
  NEXT_CUSTOMER_LOADED,
  CUSTOMER_LOADED,
  FACILITIES_LOADED,
  FOLLOWUPS_LOADED,
  FOLLOWUP_METADATA_LOADED,
  searchTypes,
} from "./config";
import { getNow } from "../utils/common";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const searchCustomer = (search, searchBy, next = () => {}) => {
  if (!search) {
    return;
  }

  return async (dispatch, getState) => {
    if (searchBy === searchTypes.PHONE_NUMBER) {
      axios({
        method: "get",
        url: API_URL + "/AccessManager/getLeadbyPhoneNumber",
        params: {
          uct: "1",
          phonenumber: search,
        },
      })
        .then((results) => {
          if (typeof results.data === "object") {
            dispatch({
              type: CUSTOMER_LOADED,
              payload: results.data,
            });
            next(results.data);
          } else {
            next();
          }
        })
        .catch(function (error) {
          toastr.error("Error", error.message);
          next();
        });
    } else {
      axios({
        method: "get",
        url: API_URL + "/AccessManager/getLeadbyCustomerID",
        params: {
          uct: "1",
          customer_id: search,
        },
      })
        .then((results) => {
          // console.log("result",results)
          if (typeof results.data === "object") {
            dispatch({
              type: CUSTOMER_LOADED,
              payload: results.data,
            });

            next(results.data);
          } else {
            next();
          }
        })
        .catch(function (error) {
          console.log(error);
          toastr.error("Error", error.message);
          next();
        });
    }
  };
};

export const autoDialCustomer = (next) => {
  return async (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/getHandlingLeadinfo",
      params: {
        uct: "1",
        agent_extension: getState().user.user_details.extension,
      },
    })
      .then((results) => {
        dispatch({
          type: CUSTOMER_LOADED,
          payload: results.data,
        });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      })
      .finally(() => {
        if (typeof next === "function") {
          next();
        }
      });
  };
};

export const getNextFacility = (next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/GetNextCustomertoDial",
      params: {
        uct: "1",
        user_id: getState().user.login_id,
      },
    })
      .then(function (results) {
        if (results.data.customer_id) {
          dispatch({
            type: NEXT_CUSTOMER_LOADED,
            payload: results.data,
          });
          next(results.data.customer_id);
        } else {
          dispatch({
            type: CUSTOMER_LOADED,
            payload: null,
          });
          // if (typeof results.data === "string") {
          //     toastr.warning('No Data Returned', results.data);
          // }
          next();
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
        next();
      });
  };
};

export const clearCurrentFacility = () => {
  return (dispatch, getState) => {
    dispatch({
      type: CUSTOMER_LOADED,
      payload: null,
    });
  };
};

export const loadFacilities = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/DIALER/GetLeadsList.htm",
      params: {
        uct: "1",
      },
      data,
    })
      .then(function (results) {
        dispatch({
          type: FACILITIES_LOADED,
          payload: results.data,
        });
        next(null, results.data);
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
        next(error);
      });
  };
};

export const followUp = (team, data, next) => {
  let path = "/DialerCore/setFollowupsReminders";
  let agent_id = null;
  const number = data.number;
  delete data.number;

  return (dispatch, getState) => {
    if (team) {
      if (typeof team === "boolean") {
        path = "/DialerCore/setFollowupsTeamReminders";
        data.note += "+++++++Assigned To: Team";
      } else {
        agent_id = team;
        data.note += "+++++++Assigned To: " + agent_id;
      }
    } else {
      data.note +=
        "+++++++Assigned To: " + getState().user.user_details.extension;
    }

    axios({
      method: "post",
      url: API_URL + path,
      params: {
        uct: "1",
        number,
      },
      data: {
        ...data,
        extension: getState().user.user_details.extension,
        agent_id: agent_id || getState().user.user_details.extension,
      },
    })
      .then(function (results) {
        toastr.success("Saved", "Follow up note saved successfully.");
        dispatch(loadFollowUps());
        next();
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const call = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/Dial",
      params: {
        uct: "1",
        customer_id: data.customer_id,
        number: data.number,
        extension: getState().user.user_details.extension,
      },
    })
      .then(function (results) {
        next();
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const callDirect = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/Dialdirect",
      params: {
        uct: "1",
        customer_id: data.customer_id,
        number: data.number,
        extension: getState().user.user_details.extension,
      },
    })
      .then(function (results) {
        next();
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const loadFollowUps = (data) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/GetFollowupCustomerList",
      params: {
        uct: "1",
        user_id: getState().user.login_id,
      },
      data,
    })
      .then(function (results) {
        dispatch({
          type: FOLLOWUPS_LOADED,
          payload: results.data.followupList,
        });
      })
      .catch(function (error) {
        // toastr.error('Error', error.message);
      });
  };
};

export const loadFollowUpMetaData = (data) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: MI_API_URL + "/getNoteCodeList",
      params: {
        uct: "1",
      },
      data,
    })
      .then(function (results) {
        dispatch({
          type: FOLLOWUP_METADATA_LOADED,
          payload: results.data.notesMasterDataVM,
        });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const deleteFollowUps = (customer_id) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DialerCore/clearFollowupReminder",
      params: {
        uct: "1",
        customer_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          dispatch(loadFollowUps());
        } else {
          toastr.error("Error", "Failed to delete the follow up detail");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const deleteFacility = (lead_id, next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: API_URL + "/DIALER/deleteLeadByID",
      params: {
        uct: "1",
        delete: CAMPAIGN_ALLOW_DUPLICATE_CONTENT ? 1 : 0,
        lead_id,
      },
    })
      .then(function (response) {
        if (response.data) {
          next();
        } else {
          toastr.error("Error", "Failed to delete the facility detail");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const addNote = (data, next) => {
  return (dispatch, getState) => {
    data.strNote = `${
      data.strNote
    } - Added by ${getState().user.user_details.first_name.trim()} ${getState().user.user_details.last_name.trim()} on ${getNow()}`;

    axios({
      method: "post",
      url: MI_API_URL + "/AddNoteToContract",
      params: {
        uct: "1",
      },
      data,
    })
      .then(function () {
        toastr.success("Saved", "Note saved successfully.");
        dispatch(loadNotes(data.contract_number));
        next();
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const searchByVehicle = (VehicleNo, next) => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: MI_API_URL + "/getNICListByVehicleNumber",
      params: {
        uct: "1",
        VehicleNo,
      },
    })
      .then(function (results) {
        next(results.data.Detail);
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const changeFollowupOwnership = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: API_URL + "/DialerCore/changeFollowupOwnership",
      params: {
        uct: "1",
      },
      data: {
        ...data,
        owner_user_id: getState().user.login_id,
      },
    })
      .then(function (results) {
        toastr.success("Success", "Follow-Ups are transfered successfully");
        next();
        dispatch(loadFollowUps());
      })
      .catch(function (error) {
        next(error);
        toastr.error("Error", error.message);
      });
  };
};

export const sendNotification = (user, message) => {
  return () => {
    if (NOTIFICATION_CHANNELS.includes("Telegram") && user.outcid) {
      axios({
        method: "post",
        url: API_URL + "/sendTelegramSMS",
        params: {
          uct: "1",
        },
        data: {
          chat_id: user.outcid.replace("G", "-"),
          text: message,
        },
      }).catch(function (error) {
        toastr.error("Error", error.message);
      });
    }
  };
};
