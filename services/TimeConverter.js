const { isDefined, isNumber, isValidString } = require("../utils");

module.exports.convertTime = ({ time }) => {
    if (!isDefined(time)) {
        return { success: false, code: 400, msg: "No time provided" };
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
            return { success: false, code: 400, msg: "Invalid timestamp number" };
        }
    }

    // let Date object handle parsing, may update in future to handle more variants
    if (isValidString(time)) {
        parseDate = new Date(time);
        if (isNaN(parseDate.getTime())) {
            return { success: false, code: 400, msg: "Invalid date string" };
        }
    }

    if (parseDate === null) {
        return { success: false, code: 400, msg: "Time must be a valid number or string" };
    }

    return {
        success: true,
        iso: parseDate.toISOString(),
        utc: parseDate.toUTCString(),
        timestamp: parseDate.getTime()
    }
};

module.exports.translateDuration = ({ value, unit }) => {
    if (!isDefined(value)) {
        return { success: false, code: 400, msg: "No value provided" };
    }

    if (!isDefined(unit)) {
        return { success: false, code: 400, msg: "No unit provided" };
    }

    if (!isNumber(value)) {
        return { success: false, code: 400, msg: "Value must be a number" };
    }

    if (!isValidString(unit)) {
        return { success: false, code: 400, msg: "Unit must be a string" };
    }

    const unitLower = unit.toLowerCase();
    const unitMap = {
        second: 1,
        minute: 60,
        hour: 60 * 60,
        day: 24 * 60 * 60
    };

    if (!unitMap[unitLower]) {
        return { success: false, code: 400, msg: "Invalid unit provided" };
    }

    const durationS = value * unitMap[unitLower];

    const days = Math.floor(durationS / (24 * 60 * 60));
    const hours = Math.floor((durationS % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((durationS % (60 * 60)) / 60);
    const seconds = durationS % 60;

    return {
        success: true,
        seconds: durationS,
        minutes: durationS / 60,
        hours: durationS / (60 * 60),
        days: durationS / (24 * 60 * 60),
        full: `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`
    }
};