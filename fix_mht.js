const fs = require("fs");
const path = require("path");

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
                base64List.push(currentBase64.replaceAll(/[\n\r]/g, ""));
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

/** This function will generate the output filename based on the input filename by adding "-edit" to the end of the filename.
This function WILL NOT determine if a file already exists with the same name and therefore will overwrite any existing previous runs
* @param {string} f - the input filename
* @returns {string} string of the output filename
*/ 
const generateOutputFilename = (f) => {
    const parentDir = path.dirname(f);
    const ext = path.extname(f);
    const originalRawName = path.basename(f, ext);

    return path.join(parentDir, originalRawName + "-edit" + ext);
};

const imgRegex = RegExp("<img[^>/]*src=['\"][^\"']+[\"'][^>/]*/?>", "sig");
// const filename = "Recording_20240806_1621.mht";
const filename = "./Recording_20250813_2227.mht";
const outputName = generateOutputFilename(filename);
const contents = fs.readFileSync(filename, "utf8");

let imageMatches = contents.matchAll(imgRegex);
let imageTags = Array.from(imageMatches,  m => m[0]);
const base64Images = findBase64Content(contents);

if (imageTags.length !== base64Images.length && imageTags.length !== base64Images.length * 2) {
    console.error("Number of images in the file does not match the number of base64 images found");
    process.exit(1);
}

// assuming images are used in order they were also sent
// otherwise logic needs to be added to match image name to base64 content received
for (let i = 0; i < imageTags.length; i++) {
    // TODO: update the data:image/jpeg;base64 to the correct type (for png)
    contents.replaceAll(imageTags[i], `<img src="data:image/jpeg;base64,${base64Images[i]}">`);
}

fs.writeFileSync(outputName, contents);
console.log("Results have been written to " + outputName);
