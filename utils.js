// utils in a utils project 

const isDefined = (value) => {
    return value !== undefined && value !== null;
};

const isValidString = (value) => {
    return isDefined(value) && typeof value === "string" && value.trim() !== "";
};

module.exports = {
    isDefined,
    isValidString
};