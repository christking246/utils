const logger = require("../logger").setup();

const imgRegex = RegExp("<img[^>/]*src=['\"][^\"']+[\"'][^>/]*/?>", "sig");

// Since the file is read into single string instead of multiple lines, we need
// to jump around based on known structure of the file to find the base 64 components
const findBase64Content = (str) => {
    const beginningTag = "--=_NextPart_SMP_";
    const base64List = [];

    for (let i = 0; i < str.length; i++) {
        const location = str.indexOf(beginningTag, i);
        if (location === -1) {
            break;
        }

        // read content type
        const contentTypeLocation = str.indexOf("Content-Type:", location);

        // this is a terrible condition but it works for now
        if (str.slice(contentTypeLocation, contentTypeLocation + 13 + 11) === "Content-Type: image/jpeg" || str.slice(contentTypeLocation, contentTypeLocation + 13 + 10) === "Content-Type: image/png") {
            // content type is image/jpeg or image/png, read base64 and add to list

            // also terrible way to determine start index
            let start = str.indexOf("JPEG", contentTypeLocation);
            if (start === -1) {
                start = str.indexOf("PNG", contentTypeLocation) + 3;
            } else {
                start += 4;
            }

            // grab base64 content
            let currentBase64 = str.substring(start).match(/([^ -]+)/)?.[1]
            if (currentBase64) {
                base64List.push({
                    clean: currentBase64.replaceAll(/[\n\r]/g, ""),
                    raw: currentBase64
                });
                i += currentBase64.length;
            } else {
                i = contentTypeLocation;
            }
        } else {
            i = location;
        }
    }

    return base64List;
}

module.exports.fixMht = async (contents) => {
    contents = String(contents);
    let imageMatches = contents.matchAll(imgRegex);
    let imageTags = Array.from(imageMatches,  m => m[0]);
    const base64Images = findBase64Content(contents);

    if (imageTags.length !== base64Images.length && imageTags.length !== base64Images.length * 2) {
        logger.error("Number of images in the file does not match the number of base64 images found");
        return { success: false, msg: "Number of images in the file does not match the number of base64 images found" };
    }

    if (imageTags.length < 1) {
        logger.warn("No images found in the provided mht file");
        return { success: true, contents };
    }

    logger.info(`Found ${imageTags.length} images in the provided mht file`);

    // assuming images are used in order they were also sent
    // otherwise logic needs to be added to match image name to base64 content received
    for (let i = 0; i < imageTags.length; i++) {
        // TODO: update the data:image/jpeg;base64 to the correct type (for png)
        if (base64Images[i]) {
            contents = contents.replaceAll(imageTags[i] +"", `<img src="data:image/jpeg;base64,${base64Images[i].clean}">`);
        }
    }

    return { success: true, contents, base64Images };
}