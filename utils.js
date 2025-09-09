// utils in a utils project

const isDefined = (value) => {
    return value !== undefined && value !== null;
};

const isValidString = (value) => {
    return isDefined(value) && typeof value === "string" && value.trim() !== "";
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

module.exports = {
    isDefined,
    isValidString,
    makeBool
};