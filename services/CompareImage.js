const { isDefined, isNumber } = require("../utils");
const logger = require("../logger").setup();

const { Jimp, diff } = require('jimp');

const normalizeImages = (img1, img2, shouldResize) => {
    const { height: img1Height, width: img1Width } = img1;
    const { height: img2Height, width: img2Width } = img2;

    if ((img1Width !== img2Width || img1Height !== img2Height) && shouldResize) {
        logger.info(`Image dimensions do not match: ${img1Width}x${img1Height} vs ${img2Width}x${img2Height}`);

        // Determine the target dimensions (use the larger of the two)
        const targetWidth = Math.max(img1Width, img2Width);
        const targetHeight = Math.max(img1Height, img2Height);

        // Create new canvases with target dimensions
        const newImg1 = new Jimp({ width: targetWidth, height: targetHeight });
        const newImg2 = new Jimp({ width: targetWidth, height: targetHeight });

        // Copy original images at top-left (0, 0)
        newImg1.blit({ src: img1, x: 0, y: 0 });
        newImg2.blit({ src: img2, x: 0, y: 0 });

        return [newImg1, newImg2];
    }

    return [img1, img2];
}

module.exports.compareImage = async (img1, img2, threshold, resize) => {
    if (!isDefined(img1)) {
        return { success: false, code: 400, msg: "Image 1 not provided" };
    }

    if (!isDefined(img2)) {
        return { success: false, code: 400, msg: "Image 2 not provided" };
    }

    if (!isDefined(threshold) || !isNumber(threshold)) {
        threshold = 0.25
    }

    threshold = Number(threshold); // in case number is a string

    // if the string has the base64 mime prefix, remove it
    if (img1.split(',').length > 1) {
        img1 = img1.split(',')[1];
    }
    if (img2.split(',').length > 1) {
        img2 = img2.split(',')[1];
    }

    try {
        const promises = await Promise.all([Jimp.fromBuffer(Buffer.from(img1, "base64")), Jimp.fromBuffer(Buffer.from(img2, "base64"))]);
        let jimpImg1 = promises[0];
        let jimpImg2 = promises[1];

        [jimpImg1, jimpImg2] = normalizeImages(jimpImg1, jimpImg2, resize);
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