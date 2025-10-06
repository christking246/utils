const { isDefined } = require("../utils");
const yaml = require('js-yaml');

module.exports.jsonToYml = (json) => {
    if (!isDefined(json)) {
        return { success: false, code: 400, msg: "No json provided" };
    }

    try {
        return {
            success: true,
            code: 200,
            ymlString: yaml.dump(json)
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error converting json to yml: " + e.message };
    }
};

module.exports.YmlToJson = (yml) => {
    if (!isDefined(yml)) {
        return { success: false, code: 400, msg: "No yml provided" };
    }

    try {
        return {
            success: true,
            code: 200,
            json: yaml.load(yml)
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error converting json to yml: " + e.message };
    }
};

// TODO: support XML, CSV, etc?