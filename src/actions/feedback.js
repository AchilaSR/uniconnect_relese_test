import { toastr } from "react-redux-toastr";
import axios from "axios";
import { API_URL, FEEDBACK_API, FEEDBACK_LINK } from "../config/globals";
import { FEEDBACK_HOTLINE_LOADED, FEEDBACK_LANGUAGES_LOADED, FEEDBACK_LIST_LOADED, FEEDBACK_TRANSFER_EXT_LOADED, FEEDBACKS_LOADED } from "./config";

axios.defaults.baseURL = FEEDBACK_API;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const getTransferedExtList = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: FEEDBACK_API + "/getTransferedExtList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: FEEDBACK_TRANSFER_EXT_LOADED, payload: response.data });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getHotlineNumberList = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: FEEDBACK_API + "/getHotlineNumberList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: FEEDBACK_HOTLINE_LOADED, payload: response.data });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getLanguageList = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: FEEDBACK_API + "/getLanguageList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: FEEDBACK_LANGUAGES_LOADED, payload: response.data });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const getFeedbackList = () => {
  return (dispatch, getState) => {
    axios({
      method: "get",
      url: FEEDBACK_API + "/getFeedbackList",
      params: {
        uct: "1",
      },
    })
      .then(function (response) {
        dispatch({ type: FEEDBACK_LIST_LOADED, payload: response.data });
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};


export const getFeedbacks = (data, next) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: FEEDBACK_API + "/getSurveyData",
      params: {
        uct: "1",
      },
      data
    })
      .then(function (response) {
        if (response.data) {
          if (next) {
            next(response.data.data);
          } else {
            dispatch({ type: FEEDBACKS_LOADED, payload: response.data });
          }
        } else {
          toastr.warning("Empty Response", "No records available");
        }
      })
      .catch(function (error) {
        toastr.error("Error", error.message);
      });
  };
};

export const sendFeedbackLink = (data, next) => {
  return (dispatch, getState) => {

    if (FEEDBACK_LINK) {
      axios({
        method: 'post',
        url: API_URL + '/DialerCore/sendSMS',
        params: {
          access_token: getState().user.access_token
        },
        data: {
          "to": data.phone,
          "message": `Please click ${FEEDBACK_LINK}?ref=${btoa(`${data.phone}|${getState().user.user_details.extension}|${data.queue}`)} to rate our service. Your input helps us improve.`,
          "from": getState().user.login_username +" - "+ getState().user.user_details.first_name 
        }
      }).then(function (response) {
        toastr.success('Success', "Feedback link sent");
        next()
      }).catch(function (error) {
        next(error);
        toastr.error('Error', error.message);
      });
    } else {
      next()
    }
  }
}