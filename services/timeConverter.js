const { isDefined, isNumber, isValidString } = require("../utils");

module.exports.convertTime = ({ time }) => {
    if (!isDefined(time)) {
        return { success: false, msg: "No time provided" };
    }

    let parseDate = null;

    // if input is a number, treat as unix timestamp
    if (isNumber(time)) {
        // do I need to handle negative ints?
        time = Number(time);
        if (time < 10_000_000_000) {
            // if timestamp is in seconds, convert to milliseconds
            time *= 1000;
        }

        parseDate = new Date(time);
        if (isNaN(parseDate.getTime())) {
            return { success: false, msg: "Invalid timestamp number" };
        }
    }

    // let Date object handle parsing, may update in future to handle more variants
    if (isValidString(time)) {
        parseDate = new Date(time);
        if (isNaN(parseDate.getTime())) {
            return { success: false, msg: "Invalid date string" };
        }
    }

    if (parseDate === null) {
        return { success: false, msg: "Time must be a valid number or string" };
    }

    return {
        success: true,
        iso: parseDate.toISOString(),
        utc: parseDate.toUTCString(),
        timestamp: parseDate.getTime()
    }
};