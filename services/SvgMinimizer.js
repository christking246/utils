const { optimize } = require("svgo");
const { isValidString } = require("../utils");

module.exports.optimizeSvg = ({ svgString }) => {
    if (!isValidString(svgString)) {
        return { success: false, code: 400, msg: "No valid svg string provided" };
    }

    const result = optimize(svgString, { multipass: true }).data;

    return {
        diff: svgString.length - result.length,
        optimizedSvg: result,
        success: true,
        code: 200
    }
};