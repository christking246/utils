// utils in a utils project

const isDefined = (value) => {
    return value !== undefined && value !== null;
};

const isValidString = (value) => {
    return isDefined(value) && typeof value === "string" && value.trim() !== "";
};

const isNumber = (value) => {
    return (typeof value === "number" || (typeof value === "string" && value !== "" && isFinite(Number(value)))) && !isNaN(value);
};

const makeBool = (value) => {
    if (!isDefined(value)) {
        return false;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    if (typeof value !== "string") {
        return false;
    }

    return value.toUpperCase() === "TRUE" || value === "1" || value.toUpperCase() === "YES";
};

// please don't pass a multi-character string as the padding character
const padRight = (v, n, c) => {
    v = v + ""; // convert to string
    if (v.length >= n) {
        return v;
    }

    for (let i = 0; i < n; i++) {
        v = v + c;
        if (v.length >= n) {
            break;
        }
    }
    return v;
}

module.exports = {
    isDefined,
    isValidString,
    makeBool,
    isNumber,
    padRight
};