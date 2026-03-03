const { isDefined, isNumber } = require("../utils");

const { Jimp, diff } = require('jimp');

module.exports.compareImage = async (img1, img2, threshold) => {
    if (!isDefined(img1)) {
        return { success: false, code: 400, msg: "Image 1 not provided" };
    }

    if (!isDefined(img2)) {
        return { success: false, code: 400, msg: "Image 2 not provided" };
    }

    if (!isDefined(threshold) || !isNumber(threshold)) {
        threshold = 0.25
    }

    try {
        const jimpImg1 = await Jimp.fromBuffer(Buffer.from(img1, "base64"));
        const jimpImg2 = await Jimp.fromBuffer(Buffer.from(img2, "base64"));

        // TODO: add a flag to choose algo for comparing different sized images?
        const result = diff(jimpImg1, jimpImg2, threshold);

        return {
            success: true,
            code: 200,
            imageDiff: await result.image.getBase64("image/png"), // should I try to return the same format as the input image?
            percent: result.percent,
            threshold
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error calculating the image diff: " + e };
    }
};