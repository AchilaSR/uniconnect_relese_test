import moment from 'moment';

function correctDate(value, stripTime = false) {
    if (!value)
        return " - ";

    let format = "YYYY-MM-DD HH:mm:ss";

    if(stripTime){
        format = "YYYY-MM-DD";
    }

    return moment.utc(value).local().format(format);
}

export default correctDate;
