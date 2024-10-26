import moment from "moment";
import { INTL_PHONE_REGEX, LOCAL_PHONE_NUMBER_LENTGH, LOCAL_PHONE_NUMBER_PREFIX, LOCAL_PHONE_REGEX } from "./globals";

export const checkPermission = (module_name, access = "READ") => {
    var userData = JSON.parse(localStorage.getItem('lbcc_user'))
    if (userData) {
        if (userData.login_rules.length > 0) {
            if (["Contacts Management", "Help Desk", "Business Partners", "Assets"].indexOf(module_name) > -1 && ["WRITE", "writeaccess", "editaccess", "deleteaccess"].indexOf(access) > -1 && !userData.crm_user) {
                return false;
            }

            for (var i = 0; i < userData.login_rules.length; i++) {
                if (userData.login_rules[i].module_name === module_name) {
                    //   console.log('in 2');
                    if (access === 'READ') {
                        if (userData.login_rules[i].readaccess) {
                            //    console.log('return true 1');
                            return true;
                        } else {
                            //    console.log('return false 3');
                            return false;
                        }
                    } else if (access === 'WRITE') {
                        if (userData.login_rules[i].writeaccess) {
                            //    console.log('return true 2');
                            return true;
                        } else {
                            //   console.log('return false 2');
                            return false;
                        }
                    } else {
                        return userData.login_rules[i][access];
                    }
                } else {
                    //console.log('in else',userData.login_rules.length);
                    //  console.log('i==>',i);
                    if ((i) === (userData.login_rules.length - 1)) {
                        //    console.log('return false 1');
                        return false;
                    } else {
                        //    console.log('in else');

                    }
                }


            }
        } else {
            console.log('return false 4');
            return false;
        }
    } else {
        console.log('return false 5');
        return false;
    }
}

export const formatCurrency = (number = 0, decimals = 2) => {
    if (isNaN(number) || number === NaN) {
        return "-";
    }

    var val = parseFloat(number).toFixed(decimals);
    var parts = val.toString().split(".");
    var num = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
    return num;
}

function pad(num) {
    if (num > 99) {
        return num;
    }

    return ("0" + num).slice(-2);
}

export function formatDuration(secs) {
    if (isNaN(secs) || !isFinite(secs)) {
        return "00:00:00";
    }

    if (!isFinite(secs)) {
        return "-";
    }

    secs = parseInt(secs);
    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;

    // var days = Math.floor(hours / 24);
    // hours = hours % 24;
    // if (days) {
    //     return days + "-" + pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
    // }
    return pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
}

export function formatFriendlyDuration(text) {
    if (text) {
        var params = text.split(":");
        var str = "";
        if (parseInt(params[0], 10) > 0) {
            str += parseInt(params[0], 10) + " hours "
        }

        if (parseInt(params[1], 10) > 0) {
            str += parseInt(params[1], 10) + "  minutes "
        }

        return str.trim();
    } else {
        return "";
    }
}

export function formatDateTime(time) {
    if (!time)
        return "";
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

export function formatDateByUnit(date, unit) {
    unit = unit.toUpperCase()[0];
    switch (unit) {
        case 'Y':
            return date.substr(0, 4);
        case 'M':
            return date.substr(0, 7);
        case 'D':
            return date.substr(0, 10);
        case 'H':
            return date.substr(11, 8);
        default:
            return date;
    }
}

export function formatMSecondsToTime(timeDifferenceMs) {
    try {
        const sec = timeDifferenceMs / 1000;
        return formatDuration(sec);
        //return new Date(timeDifferenceMs).toISOString().substring(11, 19);
    } catch (error) {
        return "00:00:00"
    }
}


export function removeMilliseconds(str = "") {
    const match = /\d{2}:\d{2}:\d{2}(?:\.\d+)/.exec(str);
    if (match) {
        return str.split(".")[0];
    } else {
        return str;
    }
}

export function getReportData(data) {
    if (typeof data === "object" && !Array.isArray(data)) {
        data = [data]
    }

    if (!data || data.length === 0 || !data[0]) {
        return { data: null, headers: null };
    }

    data = flattenArray(data);
    const uniqueKeys = new Set()

    data.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (obj[key] || !_.startsWith(key, "cf_")) {
                if (key.toLowerCase() !== "uuid") {
                    uniqueKeys.add(key);
                    obj[key] = removeMilliseconds(obj[key]);
                }
            }
        });
    });

    const headers = [...uniqueKeys].map((key) => {
        return { key, label: _.startCase(key.replace(/^cf_/, "")) };
    }).filter(a => a).sort((a, b) => a.key.startsWith("cf_") - b.key.startsWith("cf_"));

    return { data, headers };
}

export function formatPhone(data) {
    data = data.replace(/\D/g, '');

    if (LOCAL_PHONE_REGEX.test(data)) {
        return LOCAL_PHONE_NUMBER_PREFIX + data.substr(-1 * LOCAL_PHONE_NUMBER_LENTGH);
    } else if (INTL_PHONE_REGEX.test(data)) {
        return data;
    } else {
        return null;
    }
}

export function convertToKeyValue(obj) {
    const arr = [];
    for (let k in obj) {
        arr.push({
            label: obj[k],
            value: k,
        })
    }
    return arr;
}

export function removeNonAscii(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    return str.replace(/[^\x20-\x7E]/g, '');
}

export function formatTimeToSeconds(hms = "00:00:00") {
    if (hms === "") {
        return 0;
    }
    const a = hms.split(':');
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    // console.log(seconds, a);
    return seconds;
}

export function cleanObject(obj) {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj
}

export function flattenObject(data, connector = "_", c = "") {
    var result = {}
    for (var i in data) {
        if (typeof data[i] == 'object') {
            if (c.length) {
                Object.assign(result, flattenObject(data[i], connector, c + connector + i))
            } else {
                Object.assign(result, flattenObject(data[i], connector, i))
            }
        } else {
            if (c.length) {
                result[c + connector + i] = data[i]
            } else {
                result[i] = data[i]
            }
        }
    }
    return result
}

export function flattenArray(array) {
    return array.map(a => flattenObject(a))
}

export const currentDate = () => {
    return moment().format("YYYY-MM-DD");
}

export function singularize(word) {
    const endings = {
        ves: 'fe',
        ies: 'y',
        i: 'us',
        zes: 'ze',
        // ses: 's',
        es: 'e',
        s: ''
    };
    if (word) {
        return word.replace(
            new RegExp(`(${Object.keys(endings).join('|')})$`),
            r => endings[r]
        );
    }
}

export function findDeep(data, value) {
    if (!Array.isArray(data)) {
        data = Object.values(data);
    }
    var result = _.chain(data)
        .flatten()
        .find(value);

    return result;
}

export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

export function formatDispostionToString(data) {
    if (!data) {
        return "";
    }
    if (isValidJSON(data)) {
        const json = JSON.parse(data);
        if (json && typeof json === "object") {
            if (json.data) {
                return json.data.map(([key, value]) => value ? `${key}: ${value}` : null).filter(a => a).join("; ")
            } else {
                return Object.entries(json).map(([key, value], index) => {
                    if (key === 'disposition' && Array.isArray(value)) {
                        return value.map(([dispositionKey, dispositionValue], dispositionIndex) => (
                            `${dispositionKey}: ${dispositionValue}`
                        )).join("; ");
                    } else {
                        return `${key}: ${value}`;
                    }
                }).join("; ");
            }
        }
    } else {
        return data;
    }
}