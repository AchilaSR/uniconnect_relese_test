import moment from 'moment';

export const getDateRange = (type) => {
    const today = moment();

    switch (type) {
        case 'week':
        case 'Weekly':
            return today.startOf('week').format("YYYY-MM-DD") + " - " + today.endOf('week').format("YYYY-MM-DD");
        case 'month':
        case 'Monthly':
            return today.format('MMMM');
        case 'year':
        case 'Annually':
            return today.format("YYYY");
        default:
            return "";
    }
}

export const currentDateTime = () => {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}
export const getNow = (type) => {
    const today = moment();
    return today.format("MMMM Do YYYY, h:mm a")
}