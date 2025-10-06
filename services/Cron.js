const { isDefined } = require("../utils");
const cron = require('cronstrue');

module.exports.describeCron = (expression) => {
    if (!isDefined(expression)) {
        return { success: false, code: 400, msg: "No cron expression provided" };
    }

    try {
        // TODO: return a list of the next X run times?
        return {
            success: true,
            code: 200,
            description: cron.toString(expression, { verbose: true, use24HourTimeFormat: true })
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error parsing the cron expression: " + e };
    }
};